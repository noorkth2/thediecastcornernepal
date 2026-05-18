-- ═══════════════════════════════════════════════════════════════════════
-- Migration: 20260519000004_analytics_views
-- Purpose:   SQL Views + RPCs for fast, server-side aggregations
--            All RPCs use SECURITY DEFINER to bypass RLS safely
-- ═══════════════════════════════════════════════════════════════════════

-- ─── v_daily_revenue — aggregated daily sales ─────────────────────────
CREATE OR REPLACE VIEW public.v_daily_revenue AS
SELECT
  DATE(o.created_at AT TIME ZONE 'Asia/Kathmandu')  AS order_date,
  COUNT(*)                                           AS total_orders,
  COUNT(*) FILTER (WHERE o.payment_status = 'paid') AS paid_orders,
  COALESCE(SUM(o.total_amount)     FILTER (WHERE o.payment_status = 'paid'), 0) AS revenue,
  COALESCE(SUM(o.shipping_charge)  FILTER (WHERE o.payment_status = 'paid'), 0) AS shipping_revenue,
  COALESCE(SUM(o.discount_amount), 0)                                            AS total_discounts,
  COALESCE(SUM(o.tax_amount)       FILTER (WHERE o.payment_status = 'paid'), 0) AS tax_collected,
  COALESCE(AVG(o.total_amount)     FILTER (WHERE o.payment_status = 'paid'), 0) AS avg_order_value
FROM public.orders o
GROUP BY DATE(o.created_at AT TIME ZONE 'Asia/Kathmandu')
ORDER BY order_date DESC;

-- ─── v_product_revenue — per-product sales summary ────────────────────
CREATE OR REPLACE VIEW public.v_product_revenue AS
SELECT
  p.id                                              AS product_id,
  p.title,
  p.brand,
  p.category_id,
  c.name                                            AS category_name,
  p.cost_price,
  p.price                                           AS selling_price,
  p.stock_qty,
  p.reorder_threshold,
  COALESCE(SUM(oi.quantity), 0)                     AS units_sold,
  COALESCE(SUM(oi.quantity * oi.unit_price), 0)     AS gross_revenue,
  COALESCE(SUM(oi.quantity * COALESCE(p.cost_price, 0)), 0) AS cogs_simple,
  COALESCE(SUM(oi.quantity * oi.unit_price), 0) -
    COALESCE(SUM(oi.quantity * COALESCE(p.cost_price, 0)), 0) AS gross_profit
FROM public.products p
LEFT JOIN public.categories c ON c.id = p.category_id
LEFT JOIN public.order_items oi ON oi.product_id = p.id
LEFT JOIN public.orders o ON o.id = oi.order_id AND o.payment_status = 'paid'
WHERE p.is_active = true
GROUP BY p.id, p.title, p.brand, p.category_id, c.name,
         p.cost_price, p.price, p.stock_qty, p.reorder_threshold;

-- ─── RPC: get_revenue_by_period ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_revenue_by_period(
  p_start TIMESTAMPTZ,
  p_end   TIMESTAMPTZ
) RETURNS TABLE (
  order_date       DATE,
  revenue          NUMERIC,
  order_count      BIGINT,
  avg_order_value  NUMERIC,
  discount_total   NUMERIC,
  tax_total        NUMERIC
) LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT
    DATE(created_at AT TIME ZONE 'Asia/Kathmandu') AS order_date,
    COALESCE(SUM(total_amount)    FILTER (WHERE payment_status = 'paid'), 0),
    COUNT(*)                      FILTER (WHERE payment_status = 'paid'),
    CASE
      WHEN COUNT(*) FILTER (WHERE payment_status = 'paid') > 0
      THEN SUM(total_amount) FILTER (WHERE payment_status = 'paid') /
           COUNT(*) FILTER (WHERE payment_status = 'paid')
      ELSE 0
    END,
    COALESCE(SUM(discount_amount), 0),
    COALESCE(SUM(tax_amount) FILTER (WHERE payment_status = 'paid'), 0)
  FROM public.orders
  WHERE created_at BETWEEN p_start AND p_end
  GROUP BY DATE(created_at AT TIME ZONE 'Asia/Kathmandu')
  ORDER BY order_date;
$$;

-- ─── RPC: get_kpi_summary ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_kpi_summary(
  p_start      TIMESTAMPTZ,
  p_end        TIMESTAMPTZ,
  p_prev_start TIMESTAMPTZ,
  p_prev_end   TIMESTAMPTZ
) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    -- Current period
    'total_revenue',       COALESCE(SUM(total_amount)   FILTER (WHERE payment_status='paid' AND created_at BETWEEN p_start AND p_end), 0),
    'total_orders',        COUNT(*)                      FILTER (WHERE payment_status='paid' AND created_at BETWEEN p_start AND p_end),
    'avg_order_value',     COALESCE(AVG(total_amount)   FILTER (WHERE payment_status='paid' AND created_at BETWEEN p_start AND p_end), 0),
    'total_discounts',     COALESCE(SUM(discount_amount) FILTER (WHERE created_at BETWEEN p_start AND p_end), 0),
    'shipping_revenue',    COALESCE(SUM(shipping_charge) FILTER (WHERE payment_status='paid' AND created_at BETWEEN p_start AND p_end), 0),
    -- Previous period (for growth %)
    'prev_revenue',        COALESCE(SUM(total_amount)   FILTER (WHERE payment_status='paid' AND created_at BETWEEN p_prev_start AND p_prev_end), 0),
    'prev_orders',         COUNT(*)                      FILTER (WHERE payment_status='paid' AND created_at BETWEEN p_prev_start AND p_prev_end),
    -- Status breakdown
    'pending_count',       COUNT(*) FILTER (WHERE status='pending'    AND created_at BETWEEN p_start AND p_end),
    'confirmed_count',     COUNT(*) FILTER (WHERE status='confirmed'  AND created_at BETWEEN p_start AND p_end),
    'processing_count',    COUNT(*) FILTER (WHERE status='processing' AND created_at BETWEEN p_start AND p_end),
    'shipped_count',       COUNT(*) FILTER (WHERE status='shipped'    AND created_at BETWEEN p_start AND p_end),
    'delivered_count',     COUNT(*) FILTER (WHERE status='delivered'  AND created_at BETWEEN p_start AND p_end),
    'cancelled_count',     COUNT(*) FILTER (WHERE status='cancelled'  AND created_at BETWEEN p_start AND p_end),
    'refunded_count',      COUNT(*) FILTER (WHERE payment_status='refunded' AND created_at BETWEEN p_start AND p_end),
    -- Payment methods
    'cod_count',           COUNT(*) FILTER (WHERE payment_method='cod'    AND created_at BETWEEN p_start AND p_end),
    'khalti_count',        COUNT(*) FILTER (WHERE payment_method='khalti' AND created_at BETWEEN p_start AND p_end),
    'esewa_count',         COUNT(*) FILTER (WHERE payment_method='esewa'  AND created_at BETWEEN p_start AND p_end),
    'cod_revenue',         COALESCE(SUM(total_amount) FILTER (WHERE payment_method='cod'    AND payment_status='paid' AND created_at BETWEEN p_start AND p_end), 0),
    'khalti_revenue',      COALESCE(SUM(total_amount) FILTER (WHERE payment_method='khalti' AND payment_status='paid' AND created_at BETWEEN p_start AND p_end), 0),
    'esewa_revenue',       COALESCE(SUM(total_amount) FILTER (WHERE payment_method='esewa'  AND payment_status='paid' AND created_at BETWEEN p_start AND p_end), 0)
  )
  INTO v_result
  FROM public.orders
  WHERE created_at BETWEEN p_prev_start AND p_end;

  RETURN v_result;
END;
$$;

-- ─── RPC: get_hourly_order_pattern ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_hourly_order_pattern(
  p_start TIMESTAMPTZ,
  p_end   TIMESTAMPTZ
) RETURNS TABLE (
  hour_of_day  INT,
  day_of_week  INT,
  order_count  BIGINT
) LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT
    EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Kathmandu')::INT,
    EXTRACT(DOW  FROM created_at AT TIME ZONE 'Asia/Kathmandu')::INT,
    COUNT(*)
  FROM public.orders
  WHERE created_at BETWEEN p_start AND p_end
  GROUP BY 1, 2
  ORDER BY 2, 1;
$$;

-- ─── RPC: get_top_products ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_top_products(
  p_start TIMESTAMPTZ,
  p_end   TIMESTAMPTZ,
  p_limit INT DEFAULT 20
) RETURNS TABLE (
  product_id    INT,
  title         TEXT,
  brand         TEXT,
  category_name TEXT,
  units_sold    BIGINT,
  gross_revenue NUMERIC,
  cogs          NUMERIC,
  gross_profit  NUMERIC
) LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT
    p.id,
    p.title,
    p.brand,
    c.name,
    COALESCE(SUM(oi.quantity), 0)::BIGINT,
    COALESCE(SUM(oi.quantity * oi.unit_price), 0),
    COALESCE(SUM(oi.quantity * COALESCE(p.cost_price, 0)), 0),
    COALESCE(SUM(oi.quantity * oi.unit_price), 0) -
      COALESCE(SUM(oi.quantity * COALESCE(p.cost_price, 0)), 0)
  FROM public.products p
  LEFT JOIN public.categories c ON c.id = p.category_id
  LEFT JOIN public.order_items oi ON oi.product_id = p.id
  LEFT JOIN public.orders o ON o.id = oi.order_id
    AND o.payment_status = 'paid'
    AND o.created_at BETWEEN p_start AND p_end
  GROUP BY p.id, p.title, p.brand, c.name
  ORDER BY 5 DESC
  LIMIT p_limit;
$$;

-- ─── RPC: get_customer_stats ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_customer_stats(
  p_start TIMESTAMPTZ,
  p_end   TIMESTAMPTZ
) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_unique_customers',
      COUNT(DISTINCT user_id) FILTER (WHERE created_at BETWEEN p_start AND p_end AND user_id IS NOT NULL),
    'repeat_customers',
      COUNT(DISTINCT user_id) FILTER (
        WHERE user_id IN (
          SELECT user_id FROM public.orders
          WHERE payment_status = 'paid' AND user_id IS NOT NULL
          GROUP BY user_id HAVING COUNT(*) > 1
        )
        AND created_at BETWEEN p_start AND p_end
      ),
    'guest_orders',
      COUNT(*) FILTER (WHERE user_id IS NULL AND created_at BETWEEN p_start AND p_end),
    'top_city',
      (SELECT shipping_address->>'city'
       FROM public.orders
       WHERE created_at BETWEEN p_start AND p_end
         AND payment_status = 'paid'
       GROUP BY shipping_address->>'city'
       ORDER BY COUNT(*) DESC LIMIT 1)
  ) INTO v_result
  FROM public.orders;

  RETURN v_result;
END;
$$;
