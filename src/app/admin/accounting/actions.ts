'use server'

import { createClient } from '@/lib/supabase/server'
import { createExpense, createPayout } from '@/lib/supabase/queries/accounting'
import { logAdminAction } from '@/app/admin/(dashboard)/actions'
import { AUDIT_ACTIONS } from '@/lib/types/audit'
import type { NewExpenseInput, NewPayoutInput } from '@/lib/types/accounting'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from '@/lib/supabase/auth-utils'

// ─── Create expense ────────────────────────────────────────────────────
export async function createExpenseAction(input: NewExpenseInput) {
  const { user } = await verifyAdmin()

  const expense = await createExpense(input, user.id)
  await logAdminAction(AUDIT_ACTIONS.EXPENSE_CREATE, 'expense', String(expense.id), undefined, { amount: expense.amount, category: expense.category })
  revalidatePath('/admin/accounting')
  return expense
}

// ─── Create payout ─────────────────────────────────────────────────────
export async function createPayoutAction(input: NewPayoutInput) {
  const { user } = await verifyAdmin()

  const payout = await createPayout(input, user.id)
  await logAdminAction(AUDIT_ACTIONS.PAYOUT_CREATE, 'payout', String(payout.id), undefined, { amount: payout.amount, recipient: payout.recipient })
  revalidatePath('/admin/accounting')
  return payout
}
