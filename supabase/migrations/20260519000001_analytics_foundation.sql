-- ═══════════════════════════════════════════════════════════════════════
-- Migration: 20260519000001_analytics_foundation
-- Purpose:   Add analytics-ready columns to existing tables +
--            inventory_movements + stock_alerts + tax settings
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Extend products for COGS + threshold tracking ───────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS cost_price        NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS reorder_threshold INT NOT NULL DEFAULT 5;

-- ─── Extend orders for financial analytics ───────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_code     TEXT,
  ADD COLUMN IF NOT EXISTS tax_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS order_source    TEXT NOT NULL DEFAULT 'storefront';

-- ─── Extend order_items for snapshot costing ─────────────────────────
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(10,2);

-- ─── Tax settings in site_settings ───────────────────────────────────
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS tax_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS tax_rate    NUMERIC(5,2) NOT NULL DEFAULT 13.00;

-- ─── inventory_movements — every stock change event ──────────────────
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id             BIGSERIAL PRIMARY KEY,
  product_id     INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type  TEXT NOT NULL CHECK (movement_type IN (
                   'sale','return','adjustment','restock','damage','transfer','initial'
                 )),
  quantity_delta INT NOT NULL,       -- negative = reduction
  quantity_after INT NOT NULL,       -- snapshot of stock after movement
  unit_cost      NUMERIC(10,2),      -- cost per unit for FIFO batch tracking
  reference_type TEXT,               -- 'order' | 'purchase_order' | 'manual'
  reference_id   TEXT,               -- order_code, PO number, etc.
  notes          TEXT,
  performed_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_mov_product
  ON public.inventory_movements(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inv_mov_type
  ON public.inventory_movements(movement_type, created_at DESC);

-- ─── stock_alerts — threshold breach events ──────────────────────────
CREATE TABLE IF NOT EXISTS public.stock_alerts (
  id                 SERIAL PRIMARY KEY,
  product_id         INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  alert_type         TEXT NOT NULL CHECK (alert_type IN ('low_stock','out_of_stock','reorder')),
  stock_qty_at_alert INT NOT NULL,
  is_resolved        BOOLEAN NOT NULL DEFAULT false,
  resolved_at        TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_alerts_product
  ON public.stock_alerts(product_id, is_resolved);

-- ─── FIFO helper: get oldest unexhausted restock batches ─────────────
-- Used by the analytics layer to compute FIFO COGS.
CREATE OR REPLACE FUNCTION public.get_fifo_cogs(
  p_product_id INT,
  p_qty_sold   INT
) RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_remaining   INT := p_qty_sold;
  v_total_cost  NUMERIC := 0;
  rec           RECORD;
BEGIN
  -- Walk restock batches oldest-first and consume against qty_sold
  FOR rec IN
    SELECT unit_cost, quantity_delta AS batch_qty
    FROM public.inventory_movements
    WHERE product_id = p_product_id
      AND movement_type = 'restock'
      AND unit_cost IS NOT NULL
    ORDER BY created_at ASC
  LOOP
    EXIT WHEN v_remaining <= 0;
    IF rec.batch_qty >= v_remaining THEN
      v_total_cost := v_total_cost + (v_remaining * rec.unit_cost);
      v_remaining  := 0;
    ELSE
      v_total_cost := v_total_cost + (rec.batch_qty * rec.unit_cost);
      v_remaining  := v_remaining - rec.batch_qty;
    END IF;
  END LOOP;

  -- Fallback to current cost_price for any remaining units
  IF v_remaining > 0 THEN
    SELECT COALESCE(cost_price, 0) * v_remaining
    INTO v_total_cost
    FROM public.products WHERE id = p_product_id;
  END IF;

  RETURN COALESCE(v_total_cost, 0);
END;
$$;
