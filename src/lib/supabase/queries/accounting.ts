import { createClient } from '../server'
import type { Expense, NewExpenseInput, NewPayoutInput, PayoutRecord } from '@/lib/types/accounting'
import type { JournalEntry } from '@/lib/types/accounting'

// ─── Expenses ─────────────────────────────────────────────────────────
export async function getExpenses(
  startDate?: string,
  endDate?: string,
  page = 1,
  pageSize = 20
): Promise<{ data: Expense[]; count: number }> {
  const supabase = await createClient()
  let query = supabase
    .from('expenses')
    .select('*', { count: 'exact' })
    .order('expense_date', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (startDate) query = query.gte('expense_date', startDate)
  if (endDate)   query = query.lte('expense_date', endDate)

  const { data, count, error } = await query
  if (error) throw new Error(error.message)
  return { data: (data ?? []) as Expense[], count: count ?? 0 }
}

export async function createExpense(input: NewExpenseInput, userId: string): Promise<Expense> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...input, created_by: userId })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Expense
}

export async function deleteExpense(id: number): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Payouts ──────────────────────────────────────────────────────────
export async function getPayouts(
  startDate?: string,
  endDate?: string,
  page = 1,
  pageSize = 20
): Promise<{ data: PayoutRecord[]; count: number }> {
  const supabase = await createClient()
  let query = supabase
    .from('payout_records')
    .select('*', { count: 'exact' })
    .order('payout_date', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (startDate) query = query.gte('payout_date', startDate)
  if (endDate)   query = query.lte('payout_date', endDate)

  const { data, count, error } = await query
  if (error) throw new Error(error.message)
  return { data: (data ?? []) as PayoutRecord[], count: count ?? 0 }
}

export async function createPayout(input: NewPayoutInput, userId: string): Promise<PayoutRecord> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payout_records')
    .insert({ ...input, created_by: userId })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as PayoutRecord
}

// ─── Journal Entries ──────────────────────────────────────────────────
export async function getJournalEntries(
  page = 1,
  pageSize = 20
): Promise<{ data: JournalEntry[]; count: number }> {
  const supabase = await createClient()
  const { data, count, error } = await supabase
    .from('journal_entries')
    .select('*, journal_entry_items(*, ledgers(name, account_heads(name, code)))', { count: 'exact' })
    .order('entry_date', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)
  if (error) throw new Error(error.message)
  return { data: (data ?? []) as unknown as JournalEntry[], count: count ?? 0 }
}

// ─── Accounting overview stats ────────────────────────────────────────
export async function getAccountingOverview(startDate: string, endDate: string) {
  const supabase = await createClient()

  const [expensesRes, payoutsRes, revenueRes] = await Promise.all([
    supabase
      .from('expenses')
      .select('amount, category')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate),
    supabase
      .from('payout_records')
      .select('amount')
      .gte('payout_date', startDate)
      .lte('payout_date', endDate),
    supabase
      .from('orders')
      .select('total_amount, shipping_charge')
      .eq('payment_status', 'paid')
      .gte('created_at', startDate + 'T00:00:00+05:45')
      .lte('created_at', endDate + 'T23:59:59+05:45'),
  ])

  const totalRevenue  = (revenueRes.data ?? []).reduce((s: number, o: Record<string, unknown>) =>
    s + Number(o.total_amount ?? 0) + Number(o.shipping_charge ?? 0), 0)
  const totalExpenses = (expensesRes.data ?? []).reduce((s: number, e: Record<string, unknown>) =>
    s + Number(e.amount ?? 0), 0)
  const totalPayouts  = (payoutsRes.data ?? []).reduce((s: number, p: Record<string, unknown>) =>
    s + Number(p.amount ?? 0), 0)

  return {
    totalRevenue,
    totalExpenses,
    totalPayouts,
    cashBalance: totalRevenue - totalExpenses - totalPayouts,
    expenseCount: expensesRes.data?.length ?? 0,
    payoutCount: payoutsRes.data?.length ?? 0,
  }
}
