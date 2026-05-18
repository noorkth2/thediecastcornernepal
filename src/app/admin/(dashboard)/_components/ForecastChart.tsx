'use client'

import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, type TooltipProps
} from 'recharts'
import type { ForecastPoint } from '@/lib/types/analytics'

interface Props { data: ForecastPoint[] }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as ForecastPoint
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl px-4 py-3 shadow-2xl text-xs min-w-[160px]">
      <p className="text-text-faint mb-2 font-medium">{label}</p>
      {d.actualRevenue !== undefined && (
        <p className="text-brand-red font-bold">
          Actual: Rs. {d.actualRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
      )}
      <p className={d.isForecasted ? 'text-brand-gold font-bold' : 'text-text-muted'}>
        {d.isForecasted ? 'Forecast' : 'Smoothed'}: Rs. {d.predictedRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
      </p>
      {d.isForecasted && (
        <p className="text-text-faint mt-1">
          Range: Rs. {d.confidenceLow.toLocaleString('en-IN', { maximumFractionDigits: 0 })} –{' '}
          Rs. {d.confidenceHigh.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
      )}
      {d.isForecasted && <p className="text-brand-gold text-[10px] mt-1 uppercase tracking-wide">Forecasted</p>}
    </div>
  )
}

export function ForecastChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-xl p-6 flex items-center justify-center h-72 text-text-faint text-sm">
        Not enough historical data for forecasting (need at least 7 days)
      </div>
    )
  }

  // Find the split point between actual and forecasted
  const splitDate = data.find((d) => d.isForecasted)?.date

  // Only show last 60 days of actual + 30 forecasted to keep chart readable
  const actual    = data.filter((d) => !d.isForecasted).slice(-60)
  const forecasted = data.filter((d) => d.isForecasted).slice(0, 30)
  const chartData = [...actual, ...forecasted]

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-semibold text-text-primary">Revenue Forecast</h2>
          <p className="text-text-faint text-xs mt-0.5">30-day EMA projection (α = 0.3)</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 bg-brand-red inline-block rounded" />
            Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 bg-brand-gold inline-block rounded border-dashed" style={{ borderBottom: '2px dashed #F5C518', background: 'none' }} />
            Forecast
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-3 bg-brand-gold/20 inline-block rounded" />
            Confidence
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#F5C518" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#F5C518" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#333"
            tick={{ fill: '#555', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(chartData.length / 8)}
          />
          <YAxis
            stroke="#333"
            tick={{ fill: '#555', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            width={44}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#555', strokeWidth: 1, strokeDasharray: '4 4' }} />

          {/* Confidence interval area */}
          <Area type="monotone" dataKey="confidenceHigh" stroke="none" fill="url(#confidenceGrad)" />
          <Area type="monotone" dataKey="confidenceLow"  stroke="none" fill="#111111" />

          {/* Actual revenue line */}
          <Line
            type="monotone"
            dataKey="actualRevenue"
            stroke="#C0392B"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#C0392B', stroke: '#1E1E1E', strokeWidth: 2 }}
          />
          {/* EMA / forecast line */}
          <Line
            type="monotone"
            dataKey="predictedRevenue"
            stroke="#F5C518"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            activeDot={{ r: 4, fill: '#F5C518', stroke: '#1E1E1E', strokeWidth: 2 }}
          />

          {/* Vertical reference line at forecast start */}
          {splitDate && (
            <ReferenceLine
              x={data.find((d) => d.date === splitDate)?.label}
              stroke="#555"
              strokeDasharray="4 4"
              label={{ value: 'Forecast start', fill: '#555', fontSize: 10, position: 'insideTopLeft' }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
