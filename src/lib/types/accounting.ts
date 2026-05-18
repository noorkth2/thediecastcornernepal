// ─── Account Head (Chart of Accounts) ────────────────────────────────
export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'cogs' | 'expense'

export interface AccountHead {
  id: number
  code: string
  name: string
  account_type: AccountType
  parent_id: number | null
  is_system: boolean
  description: string | null
  created_at: string
}

// ─── Ledger ────────────────────────────────────────────────────────────
export interface Ledger {
  id: number
  account_head_id: number
  name: string
  currency: string
  opening_balance: number
  current_balance: number
  is_active: boolean
  created_at: string
  // Joined
  account_head?: AccountHead
}

// ─── Journal Entry ─────────────────────────────────────────────────────
export type JournalEntryStatus = 'draft' | 'posted' | 'void'

export interface JournalEntry {
  id: number
  entry_number: string
  entry_date: string
  description: string
  reference_type: string | null
  reference_id: string | null
  status: JournalEntryStatus
  created_by: string | null
  created_at: string
  // Joined
  items?: JournalEntryItem[]
}

export interface JournalEntryItem {
  id: number
  journal_entry_id: number
  ledger_id: number
  debit_amount: number
  credit_amount: number
  description: string | null
  // Joined
  ledger?: Ledger
}

// ─── Expense ─────────────────────────────────────────────────────────
export type ExpenseCategory =
  | 'marketing'
  | 'operations'
  | 'shipping'
  | 'platform_fee'
  | 'packaging'
  | 'payment_gateway_fee'
  | 'salary'
  | 'rent'
  | 'utilities'
  | 'tax'
  | 'other'

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  marketing:            'Marketing',
  operations:           'Operations',
  shipping:             'Shipping & Logistics',
  platform_fee:         'Platform & Tech',
  packaging:            'Packaging',
  payment_gateway_fee:  'Payment Gateway Fee',
  salary:               'Salary & Wages',
  rent:                 'Rent',
  utilities:            'Utilities',
  tax:                  'Tax',
  other:                'Other',
}

export interface Expense {
  id: number
  expense_date: string
  category: ExpenseCategory
  amount: number
  description: string
  vendor: string | null
  receipt_url: string | null
  is_recurring: boolean
  created_by: string | null
  created_at: string
}

// ─── Payout Record ─────────────────────────────────────────────────────
export type PayoutRecipientType = 'supplier' | 'logistics' | 'employee' | 'other'
export type PayoutMethod = 'bank_transfer' | 'cash' | 'mobile_banking' | 'cheque'

export interface PayoutRecord {
  id: number
  payout_date: string
  recipient: string
  recipient_type: PayoutRecipientType
  amount: number
  payment_method: PayoutMethod
  reference: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

// ─── New Expense Form ─────────────────────────────────────────────────
export interface NewExpenseInput {
  expense_date: string
  category: ExpenseCategory
  amount: number
  description: string
  vendor?: string
  receipt_url?: string
  is_recurring: boolean
}

// ─── New Payout Form ──────────────────────────────────────────────────
export interface NewPayoutInput {
  payout_date: string
  recipient: string
  recipient_type: PayoutRecipientType
  amount: number
  payment_method: PayoutMethod
  reference?: string
  notes?: string
}
