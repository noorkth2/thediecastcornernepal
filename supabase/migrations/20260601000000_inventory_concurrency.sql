-- ─── INVENTORY CONCURRENCY & RESERVATIONS ─────────────────────────────

-- 1. Add reservation_id to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS reservation_id uuid;

-- 2. Improve decrement_stock to be atomic and conditional
DROP FUNCTION IF EXISTS public.decrement_stock(int, int);
CREATE OR REPLACE FUNCTION public.decrement_stock(p_product_id int, p_qty int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.products
  SET stock_qty = stock_qty - p_qty
  WHERE id = p_product_id AND stock_qty >= p_qty;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product_id %', p_product_id;
  END IF;
END;
$$;

-- 3. Multi-item reservation for orders
CREATE OR REPLACE FUNCTION public.reserve_order_stock(
  p_order_id int,
  p_session text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_item record;
  v_res jsonb;
  v_reservation_id uuid;
  v_reservations uuid[] := '{}';
BEGIN
  FOR v_item IN SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id LOOP
    v_res := public.reserve_stock(v_item.product_id, NULL, p_session, v_item.quantity);
    
    IF NOT (v_res->>'success')::boolean THEN
      -- Rollback: Release all previously made reservations in this loop
      IF array_length(v_reservations, 1) > 0 THEN
        DELETE FROM public.stock_reservations WHERE id = ANY(v_reservations);
      END IF;
      RETURN v_res;
    END IF;
    
    v_reservations := v_reservations || (v_res->>'reservation_id')::uuid;
  END LOOP;

  -- Store the FIRST reservation_id in the order for tracking
  UPDATE public.orders SET reservation_id = v_reservations[1] WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'reservation_ids', v_reservations);
END;
$$;

-- 4. Confirm sale from reservations
CREATE OR REPLACE FUNCTION public.confirm_reservation_sale(p_order_id int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order_code text;
  v_item record;
BEGIN
  SELECT order_code INTO v_order_code FROM public.orders WHERE id = p_order_id;
  
  -- Decrement actual stock
  FOR v_item IN SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id LOOP
    PERFORM public.decrement_stock(v_item.product_id, v_item.quantity);
  END LOOP;
  
  -- Clear reservations for this session (using order_code as session_id)
  DELETE FROM public.stock_reservations WHERE session_id = v_order_code;
  
  -- Clear reservation_id from order
  UPDATE public.orders SET reservation_id = NULL WHERE id = p_order_id;
END;
$$;
