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

// ─── Navigation ───────────────────────────────────────────────────────────────

export const NAV_LINKS = [
  { label: 'Shop All', href: '/shop' },
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Pre-Orders', href: '/pre-orders' },
  { label: 'Treasure Hunt', href: '/treasure-hunt' },
] as const

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/thediecastcornernepal',
  facebook: 'https://facebook.com/thediecastcornernepal',
  tiktok: 'https://tiktok.com/@thediecastcornernepal',
}

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
  pending: { label: 'Pending Review', color: 'text-yellow-500', bg: 'bg-yellow-500/10', step: 1 },
  confirmed: { label: 'Confirmed', color: 'text-blue-500', bg: 'bg-blue-500/10', step: 2 },
  processing: { label: 'Processing', color: 'text-purple-500', bg: 'bg-purple-500/10', step: 3 },
  shipped: { label: 'In Transit', color: 'text-orange-500', bg: 'bg-orange-500/10', step: 4 },
  delivered: { label: 'Delivered', color: 'text-green-500', bg: 'bg-green-500/10', step: 5 },
  cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-500/10', step: 0 },
} as const

// Legacy alias for older components
export const ORDER_STATUS_CONFIG = ORDER_STATUSES

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

// ─── Configuration ────────────────────────────────────────────────────────────

export const FREE_SHIPPING_THRESHOLD = 2000
export const STANDARD_SHIPPING = 150
export const PRODUCTS_PER_PAGE = 24
export const SCALES = ['1:64', '1:43', '1:24', '1:18', '1:12', 'Other'] as const
