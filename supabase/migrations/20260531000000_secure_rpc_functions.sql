-- ─── Helper: check_admin_access ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  RETURN TRUE;
END;
$$;

-- ─── Update Analytics RPCs with role checks ──────────────────────────

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
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM public.check_admin_access();
  RETURN QUERY
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
END;
$$;

CREATE OR REPLACE FUNCTION public.get_kpi_summary(
  p_start      TIMESTAMPTZ,
  p_end        TIMESTAMPTZ,
  p_prev_start TIMESTAMPTZ,
  p_prev_end   TIMESTAMPTZ
) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_result JSON;
BEGIN
  PERFORM public.check_admin_access();
  
  SELECT json_build_object(
    'total_revenue',       COALESCE(SUM(total_amount)   FILTER (WHERE payment_status='paid' AND created_at BETWEEN p_start AND p_end), 0),
    'total_orders',        COUNT(*)                      FILTER (WHERE payment_status='paid' AND created_at BETWEEN p_start AND p_end),
    'avg_order_value',     COALESCE(AVG(total_amount)   FILTER (WHERE payment_status='paid' AND created_at BETWEEN p_start AND p_end), 0),
    'total_discounts',     COALESCE(SUM(discount_amount) FILTER (WHERE created_at BETWEEN p_start AND p_end), 0),
    'shipping_revenue',    COALESCE(SUM(shipping_charge) FILTER (WHERE payment_status='paid' AND created_at BETWEEN p_start AND p_end), 0),
    'prev_revenue',        COALESCE(SUM(total_amount)   FILTER (WHERE payment_status='paid' AND created_at BETWEEN p_prev_start AND p_prev_end), 0),
    'prev_orders',         COUNT(*)                      FILTER (WHERE payment_status='paid' AND created_at BETWEEN p_prev_start AND p_prev_end),
    'pending_count',       COUNT(*) FILTER (WHERE status='pending'    AND created_at BETWEEN p_start AND p_end),
    'confirmed_count',     COUNT(*) FILTER (WHERE status='confirmed'  AND created_at BETWEEN p_start AND p_end),
    'processing_count',    COUNT(*) FILTER (WHERE status='processing' AND created_at BETWEEN p_start AND p_end),
    'shipped_count',       COUNT(*) FILTER (WHERE status='shipped'    AND created_at BETWEEN p_start AND p_end),
    'delivered_count',     COUNT(*) FILTER (WHERE status='delivered'  AND created_at BETWEEN p_start AND p_end),
    'cancelled_count',     COUNT(*) FILTER (WHERE status='cancelled'  AND created_at BETWEEN p_start AND p_end),
    'refunded_count',      COUNT(*) FILTER (WHERE payment_status='refunded' AND created_at BETWEEN p_start AND p_end),
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
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM public.check_admin_access();
  RETURN QUERY
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
END;
$$;

CREATE OR REPLACE FUNCTION public.get_customer_stats(
  p_start TIMESTAMPTZ,
  p_end   TIMESTAMPTZ
) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_result JSON;
BEGIN
  PERFORM public.check_admin_access();
  
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

CREATE OR REPLACE FUNCTION public.get_fifo_cogs(
  p_product_id INT,
  p_qty_sold   INT
) RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_remaining   INT := p_qty_sold;
  v_total_cost  NUMERIC := 0;
  rec           RECORD;
BEGIN
  PERFORM public.check_admin_access();

  FOR rec IN
    SELECT unit_cost, quantity_delta AS batch_qty
    FROM public.inventory_movements
    WHERE product_id = p_product_id
      AND movement_type = 'restock'
      AND unit_cost IS NOT NULL
    ORDER BY created_at ASC
  LOOP
    IF v_remaining <= 0 THEN EXIT; END IF;
    
    IF rec.batch_qty <= v_remaining THEN
      v_total_cost := v_total_cost + (rec.batch_qty * rec.unit_cost);
      v_remaining := v_remaining - rec.batch_qty;
    ELSE
      v_total_cost := v_total_cost + (v_remaining * rec.unit_cost);
      v_remaining := 0;
    END IF;
  END LOOP;

  RETURN v_total_cost;
END;
$$;

-- ─── Stock Manipulation Protection ───────────────────────────────────

CREATE OR REPLACE FUNCTION public.decrement_stock(product_id int, qty int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- We allow decrement_stock if it's called via a server-side route
  -- But to be safe, we could restrict it to service_role OR add a check
  -- In this app, it's called from api/orders/route.ts which uses service role usually
  -- or authenticated user. 
  -- If we want to be strict:
  -- PERFORM public.check_admin_access(); 
  -- But that would break customer orders if the API route uses the user's token.
  
  -- Better: ONLY allow if caller is admin OR it's being called internally by the system.
  -- For now, let's at least ensure it's not publicly executable without any auth.
  
  UPDATE public.products
  SET stock_qty = GREATEST(0, stock_qty - qty)
  WHERE id = product_id;
END;
$$;

-- ─── Admin-only RPCs ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.refresh_product_affinity()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM public.check_admin_access();
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.product_affinity;
END;
$$;

-- ─── Revoke and Regrant ───────────────────────────────────────────────

-- Revoke from public to ensure NO ONE can execute without explicit grant
REVOKE EXECUTE ON FUNCTION public.get_revenue_by_period(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_kpi_summary(TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_top_products(TIMESTAMPTZ, TIMESTAMPTZ, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_customer_stats(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_fifo_cogs(INT, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.decrement_stock(INT, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reserve_stock(INT, INT, TEXT, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.release_stock(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reserve_preorder_slot(INT, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.refresh_product_affinity() FROM PUBLIC;

-- Re-grant to authenticated (but they will now hit the internal role check for analytics)
GRANT EXECUTE ON FUNCTION public.get_revenue_by_period(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_kpi_summary(TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_products(TIMESTAMPTZ, TIMESTAMPTZ, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_customer_stats(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_fifo_cogs(INT, INT) TO authenticated;

-- Mutations are now ONLY called via service role admin client in API routes
-- so we DO NOT grant them to authenticated or PUBLIC.
-- They include: decrement_stock, reserve_stock, release_stock, reserve_preorder_slot, refresh_product_affinity
