/**
 * DICTIONARIES & ENUMERATIONS
 * Shared constants across the application to ensure consistency.
 */

// ─── Site Metadata ────────────────────────────────────────────────────────────

export const SITE_NAME = 'The Diecast Corner Nepal'
export const SITE_URL = process.env.NEXT_PUBLIC_URL || 'https://thediecastcornernepal.com'

// ─── Categories (Matching DB Slugs) ───────────────────────────────────────────

export const CATEGORIES = [
  { name: 'MiniGT', slug: 'minigt' },
  { name: 'Tomica', slug: 'tomica' },
  { name: 'Matchbox', slug: 'matchbox' },
  { name: 'Greenlight', slug: 'greenlight' },
  { name: 'Majorette', slug: 'majorette' },
  { name: 'INNO64', slug: 'inno64' },
  { name: 'Tarmac Works', slug: 'tarmac-works' },
  { name: 'Auto World', slug: 'auto-world' },
  { name: 'M2 Machines', slug: 'm2-machines' },
  { name: 'Era Car', slug: 'era-car' },
  { name: 'Premium 1:18 & 1:24', slug: 'premium' },
  { name: 'Treasure Hunts', slug: 'treasure-hunts' },
  { name: 'Limited Edition', slug: 'limited-edition' },
] as const

// ─── Nepal Locations ──────────────────────────────────────────────────────────

export const NEPAL_CITIES = [
  'Kathmandu',
  'Lalitpur',
  'Bhaktapur',
  'Pokhara',
  'Butwal',
  'Narayangarh',
  'Chitwan',
  'Biratnagar',
  'Dharan',
  'Itahari',
  'Birgunj',
  'Nepalgunj',
  'Bhairahawa',
  'Hetauda',
  'Dhangadhi',
  'Birtamod',
] as const

// ─── Order Statuses ───────────────────────────────────────────────────────────

export const ORDER_STATUSES = {
  pending: { label: 'Pending Review', color: 'bg-yellow-500/10 text-yellow-500' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-500' },
  processing: { label: 'Processing', color: 'bg-purple-500/10 text-purple-500' },
  shipped: { label: 'In Transit', color: 'bg-orange-500/10 text-orange-500' },
  delivered: { label: 'Delivered', color: 'bg-green-500/10 text-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-500' },
} as const

export const PAYMENT_STATUSES = {
  unpaid: { label: 'Unpaid', color: 'bg-red-500/10 text-red-500' },
  paid: { label: 'Paid', color: 'bg-green-500/10 text-green-500' },
  refunded: { label: 'Refunded', color: 'bg-gray-500/10 text-gray-500' },
} as const

// ─── Payment Methods ──────────────────────────────────────────────────────────

export const PAYMENT_METHODS = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    logo: null,
  },
  {
    id: 'khalti',
    label: 'Khalti',
    description: 'Pay with Khalti digital wallet',
    logo: '/logos/khalti.png',
  },
  {
    id: 'esewa',
    label: 'eSewa',
    description: 'Pay with eSewa digital wallet',
    logo: '/logos/esewa.png',
  },
] as const

// ─── Free Shipping ────────────────────────────────────────────────────────────

export const FREE_SHIPPING_THRESHOLD = 2000
export const STANDARD_SHIPPING = 150
