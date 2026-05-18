-- ═══════════════════════════════════════════════════════════════════════
-- Migration: 20260519000002_accounting_tables
-- Purpose:   Full double-entry accounting foundation
--            Chart of Accounts → Ledgers → Journal Entries → Line Items
--            + Expenses + Payout Records
-- ═══════════════════════════════════════════════════════════════════════

-- ─── account_heads — Chart of Accounts ───────────────────────────────
-- Standard numbering: 1xxx=Asset, 2xxx=Liability, 3xxx=Equity,
--                     4xxx=Revenue, 5xxx=COGS, 6xxx=Expense
CREATE TABLE IF NOT EXISTS public.account_heads (
  id           SERIAL PRIMARY KEY,
  code         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN (
                  'asset','liability','equity','revenue','cogs','expense'
                )),
  parent_id    INT REFERENCES public.account_heads(id) ON DELETE SET NULL,
  is_system    BOOLEAN NOT NULL DEFAULT false,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ledgers — sub-accounts under account_heads ──────────────────────
CREATE TABLE IF NOT EXISTS public.ledgers (
  id              SERIAL PRIMARY KEY,
  account_head_id INT NOT NULL REFERENCES public.account_heads(id) ON DELETE RESTRICT,
  name            TEXT NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'NPR',
  opening_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── journal_entries — transaction headers ───────────────────────────
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id             SERIAL PRIMARY KEY,
  entry_number   TEXT NOT NULL UNIQUE,   -- 'JE-2026-0001'
  entry_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  description    TEXT NOT NULL,
  reference_type TEXT,                   -- 'order'|'expense'|'adjustment'|'payout'
  reference_id   TEXT,
  status         TEXT NOT NULL DEFAULT 'posted'
                   CHECK (status IN ('draft','posted','void')),
  created_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── journal_entry_items — double-entry lines ─────────────────────────
-- Invariant: SUM(debit) = SUM(credit) per journal_entry_id
CREATE TABLE IF NOT EXISTS public.journal_entry_items (
  id               SERIAL PRIMARY KEY,
  journal_entry_id INT NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  ledger_id        INT NOT NULL REFERENCES public.ledgers(id) ON DELETE RESTRICT,
  debit_amount     NUMERIC(14,2) NOT NULL DEFAULT 0,
  credit_amount    NUMERIC(14,2) NOT NULL DEFAULT 0,
  description      TEXT,
  CONSTRAINT chk_debit_xor_credit CHECK (
    (debit_amount > 0 AND credit_amount = 0) OR
    (credit_amount > 0 AND debit_amount = 0) OR
    (debit_amount = 0 AND credit_amount = 0)
  )
);

CREATE INDEX IF NOT EXISTS idx_je_items_journal
  ON public.journal_entry_items(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_je_items_ledger
  ON public.journal_entry_items(ledger_id);

-- ─── expenses — operational cost tracking ────────────────────────────
CREATE TABLE IF NOT EXISTS public.expenses (
  id           SERIAL PRIMARY KEY,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category     TEXT NOT NULL CHECK (category IN (
                  'marketing','operations','shipping','platform_fee',
                  'packaging','payment_gateway_fee','salary','rent',
                  'utilities','tax','other'
                )),
  amount       NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  description  TEXT NOT NULL,
  vendor       TEXT,
  receipt_url  TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  created_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date
  ON public.expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category
  ON public.expenses(category);

-- ─── payout_records — disbursements ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payout_records (
  id             SERIAL PRIMARY KEY,
  payout_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  recipient      TEXT NOT NULL,
  recipient_type TEXT NOT NULL DEFAULT 'supplier'
                   CHECK (recipient_type IN ('supplier','logistics','employee','other')),
  amount         NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN (
                   'bank_transfer','cash','mobile_banking','cheque'
                 )),
  reference      TEXT,
  notes          TEXT,
  created_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_date
  ON public.payout_records(payout_date DESC);

-- ─── Sequence for journal entry numbers ──────────────────────────────
CREATE SEQUENCE IF NOT EXISTS public.journal_entry_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.next_journal_entry_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  seq_val INT;
BEGIN
  seq_val := nextval('public.journal_entry_seq');
  RETURN 'JE-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq_val::TEXT, 4, '0');
END;
$$;

-- ─── Seed: Default Chart of Accounts ─────────────────────────────────
INSERT INTO public.account_heads (code, name, account_type, is_system, description) VALUES
  ('1000', 'Cash & Bank',            'asset',     true, 'Cash on hand and bank accounts'),
  ('1100', 'Accounts Receivable',    'asset',     true, 'Money owed by customers'),
  ('1200', 'Inventory Asset',        'asset',     true, 'Value of stock on hand'),
  ('1300', 'Prepaid Expenses',       'asset',     true, 'Prepaid costs'),
  ('2000', 'Accounts Payable',       'liability', true, 'Money owed to suppliers'),
  ('2100', 'Tax Payable',            'liability', true, 'VAT / GST payable'),
  ('2200', 'Accrued Liabilities',    'liability', true, 'Expenses incurred but not paid'),
  ('3000', 'Owner Equity',           'equity',    true, 'Owner capital'),
  ('4000', 'Sales Revenue',          'revenue',   true, 'Revenue from product sales'),
  ('4100', 'Shipping Revenue',       'revenue',   true, 'Shipping charge collected'),
  ('4200', 'Other Revenue',          'revenue',   true, 'Miscellaneous revenue'),
  ('5000', 'Cost of Goods Sold',     'cogs',      true, 'Direct cost of products sold'),
  ('6000', 'Marketing Expense',      'expense',   true, 'Advertising and promotions'),
  ('6100', 'Operations Expense',     'expense',   true, 'Operational costs'),
  ('6200', 'Shipping Expense',       'expense',   true, 'Delivery and logistics costs'),
  ('6300', 'Platform & Tech Fees',   'expense',   true, 'Payment gateway, hosting fees'),
  ('6400', 'Salary & Wages',         'expense',   true, 'Employee compensation'),
  ('6500', 'Packaging Expense',      'expense',   true, 'Packaging materials'),
  ('6600', 'Utilities & Rent',       'expense',   true, 'Overhead costs'),
  ('6700', 'Miscellaneous Expense',  'expense',   true, 'Other operational expenses')
ON CONFLICT (code) DO NOTHING;

-- Seed default ledgers linked to system account heads
INSERT INTO public.ledgers (account_head_id, name, currency, opening_balance, current_balance)
SELECT id, name || ' Ledger', 'NPR', 0, 0
FROM public.account_heads
WHERE is_system = true
ON CONFLICT DO NOTHING;
