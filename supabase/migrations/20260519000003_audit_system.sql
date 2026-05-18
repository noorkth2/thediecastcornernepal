-- ═══════════════════════════════════════════════════════════════════════
-- Migration: 20260519000003_audit_system
-- Purpose:   Full audit trail for all critical admin actions
--            activity_logs, order_status_logs, pricing_change_logs
-- ═══════════════════════════════════════════════════════════════════════

-- ─── activity_logs — general immutable audit trail ────────────────────
-- BIGSERIAL for high-volume insert performance
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          BIGSERIAL PRIMARY KEY,
  actor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role  TEXT,
  action      TEXT NOT NULL,           -- e.g. 'product.update', 'order.cancel'
  entity_type TEXT NOT NULL,           -- 'product','order','category', etc.
  entity_id   TEXT,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_actor
  ON public.activity_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity
  ON public.activity_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action
  ON public.activity_logs(action, created_at DESC);
-- Regular index for recent logs — fast dashboard queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_recent
  ON public.activity_logs(created_at DESC);

-- ─── order_status_logs — order lifecycle trail ────────────────────────
CREATE TABLE IF NOT EXISTS public.order_status_logs (
  id          SERIAL PRIMARY KEY,
  order_id    INT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status  TEXT,
  new_status  TEXT NOT NULL,
  changed_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_logs_order
  ON public.order_status_logs(order_id, created_at DESC);

-- Auto-log order status changes via trigger
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_logs (order_id, old_status, new_status, created_at)
    VALUES (NEW.id, OLD.status, NEW.status, NOW());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_status_log ON public.orders;
CREATE TRIGGER trg_order_status_log
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- ─── pricing_change_logs — product price history ──────────────────────
CREATE TABLE IF NOT EXISTS public.pricing_change_logs (
  id                 SERIAL PRIMARY KEY,
  product_id         INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  old_price          NUMERIC(10,2),
  new_price          NUMERIC(10,2),
  old_compare_price  NUMERIC(10,2),
  new_compare_price  NUMERIC(10,2),
  old_cost_price     NUMERIC(10,2),
  new_cost_price     NUMERIC(10,2),
  changed_by         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason             TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_logs_product
  ON public.pricing_change_logs(product_id, created_at DESC);

-- Auto-log price changes via trigger
CREATE OR REPLACE FUNCTION public.log_pricing_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF (OLD.price IS DISTINCT FROM NEW.price) OR
     (OLD.compare_price IS DISTINCT FROM NEW.compare_price) OR
     (OLD.cost_price IS DISTINCT FROM NEW.cost_price) THEN
    INSERT INTO public.pricing_change_logs (
      product_id, old_price, new_price,
      old_compare_price, new_compare_price,
      old_cost_price, new_cost_price
    ) VALUES (
      NEW.id, OLD.price, NEW.price,
      OLD.compare_price, NEW.compare_price,
      OLD.cost_price, NEW.cost_price
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pricing_log ON public.products;
CREATE TRIGGER trg_pricing_log
  AFTER UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.log_pricing_change();
