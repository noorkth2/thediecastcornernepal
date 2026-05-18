-- ═══════════════════════════════════════════════════════════════════════
-- Migration: 20260519000005_rls_analytics
-- Purpose:   RLS policies for all new tables (admin-only access)
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Enable RLS on all new tables ────────────────────────────────────
ALTER TABLE public.inventory_movements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_heads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledgers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_records       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_change_logs  ENABLE ROW LEVEL SECURITY;

-- ─── Helper: is_admin ────────────────────────────────────────────────
-- Reuse inline subquery pattern consistent with existing policies

-- ─── inventory_movements ─────────────────────────────────────────────
CREATE POLICY "inventory_movements_admin_all"
  ON public.inventory_movements FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ─── stock_alerts ────────────────────────────────────────────────────
CREATE POLICY "stock_alerts_admin_all"
  ON public.stock_alerts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ─── account_heads ───────────────────────────────────────────────────
CREATE POLICY "account_heads_admin_all"
  ON public.account_heads FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ─── ledgers ─────────────────────────────────────────────────────────
CREATE POLICY "ledgers_admin_all"
  ON public.ledgers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ─── journal_entries ─────────────────────────────────────────────────
CREATE POLICY "journal_entries_admin_all"
  ON public.journal_entries FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ─── journal_entry_items ─────────────────────────────────────────────
CREATE POLICY "journal_entry_items_admin_all"
  ON public.journal_entry_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ─── expenses ────────────────────────────────────────────────────────
CREATE POLICY "expenses_admin_all"
  ON public.expenses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ─── payout_records ──────────────────────────────────────────────────
CREATE POLICY "payout_records_admin_all"
  ON public.payout_records FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ─── activity_logs ───────────────────────────────────────────────────
-- INSERT is allowed for service_role (triggered from server actions)
-- SELECT/UPDATE/DELETE only for admins
CREATE POLICY "activity_logs_admin_read"
  ON public.activity_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "activity_logs_admin_insert"
  ON public.activity_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ─── order_status_logs ───────────────────────────────────────────────
-- Trigger inserts via SECURITY DEFINER — public reads for admins
CREATE POLICY "order_status_logs_admin_all"
  ON public.order_status_logs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ─── pricing_change_logs ─────────────────────────────────────────────
CREATE POLICY "pricing_change_logs_admin_all"
  ON public.pricing_change_logs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ─── Grant execute on RPCs to authenticated users ────────────────────
-- (RPCs are SECURITY DEFINER so they bypass RLS internally)
GRANT EXECUTE ON FUNCTION public.get_revenue_by_period(TIMESTAMPTZ, TIMESTAMPTZ)          TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_kpi_summary(TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_hourly_order_pattern(TIMESTAMPTZ, TIMESTAMPTZ)       TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_products(TIMESTAMPTZ, TIMESTAMPTZ, INT)          TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_customer_stats(TIMESTAMPTZ, TIMESTAMPTZ)             TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_fifo_cogs(INT, INT)                                  TO authenticated;
GRANT EXECUTE ON FUNCTION public.next_journal_entry_number()                              TO authenticated;
