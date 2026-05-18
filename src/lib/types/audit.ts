// ─── Activity Log ─────────────────────────────────────────────────────
export interface ActivityLog {
  id: string           // BigInt as string
  actor_id: string | null
  actor_role: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  // Joined
  actor?: { full_name: string | null; role: string } | null
}

// ─── Order Status Log ─────────────────────────────────────────────────
export interface OrderStatusLog {
  id: number
  order_id: number
  old_status: string | null
  new_status: string
  changed_by: string | null
  notes: string | null
  created_at: string
  // Joined
  changer?: { full_name: string | null } | null
}

// ─── Pricing Change Log ───────────────────────────────────────────────
export interface PricingChangeLog {
  id: number
  product_id: number
  old_price: number | null
  new_price: number | null
  old_compare_price: number | null
  new_compare_price: number | null
  old_cost_price: number | null
  new_cost_price: number | null
  changed_by: string | null
  reason: string | null
  created_at: string
  // Joined
  product?: { title: string; brand: string | null } | null
}

// ─── Inventory Movement ───────────────────────────────────────────────
export type MovementType = 'sale' | 'return' | 'adjustment' | 'restock' | 'damage' | 'transfer' | 'initial'

export interface InventoryMovement {
  id: string           // BigInt as string
  product_id: number
  movement_type: MovementType
  quantity_delta: number
  quantity_after: number
  unit_cost: number | null
  reference_type: string | null
  reference_id: string | null
  notes: string | null
  performed_by: string | null
  created_at: string
  // Joined
  product?: { title: string; brand: string | null } | null
}

// ─── Audit action enum ───────────────────────────────────────────────
export const AUDIT_ACTIONS = {
  PRODUCT_CREATE:       'product.create',
  PRODUCT_UPDATE:       'product.update',
  PRODUCT_DELETE:       'product.delete',
  ORDER_STATUS_CHANGE:  'order.status_change',
  ORDER_CANCEL:         'order.cancel',
  BANNER_UPDATE:        'banner.update',
  CATEGORY_UPDATE:      'category.update',
  EXPENSE_CREATE:       'expense.create',
  PAYOUT_CREATE:        'payout.create',
  JOURNAL_ENTRY_POST:   'journal.post',
  SETTINGS_UPDATE:      'settings.update',
  INVENTORY_ADJUST:     'inventory.adjust',
} as const

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS]
