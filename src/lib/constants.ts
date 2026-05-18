// ─── Scales ───────────────────────────────────────────────────────────────────

export const SCALES = [
  '1:64',
  '1:43',
  '1:36',
  '1:32',
  '1:24',
  '1:18',
  '1:12',
] as const

export type Scale = (typeof SCALES)[number]

// ─── Nepal Cities ─────────────────────────────────────────────────────────────

export const NEPAL_CITIES = [
  'Kathmandu',
  'Lalitpur',
  'Bhaktapur',
  'Pokhara',
  'Chitwan',
  'Biratnagar',
  'Birgunj',
  'Butwal',
  'Dharan',
  'Hetauda',
  'Itahari',
  'Janakpur',
  'Nepalgunj',
  'Dhangadhi',
  'Bharatpur',
] as const

// ─── Navigation ───────────────────────────────────────────────────────────────

export const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'Brands', href: '/brands' },
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Treasure Hunt', href: '/treasure-hunt' },
] as const

// ─── Order Status Config ──────────────────────────────────────────────────────

export const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    step: 0,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    step: 1,
  },
  processing: {
    label: 'Processing',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    step: 2,
  },
  shipped: {
    label: 'Shipped',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    step: 3,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    step: 4,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    step: -1,
  },
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
    label: 'Khalti (Coming Soon)',
    description: 'Pay with Khalti digital wallet',
    logo: '/logos/khalti.svg',
    disabled: true,
  },
  {
    id: 'esewa',
    label: 'eSewa (Coming Soon)',
    description: 'Pay with eSewa digital wallet',
    logo: '/logos/esewa.svg',
    disabled: true,
  },
] as const

// ─── Free Shipping ────────────────────────────────────────────────────────────

export const FREE_SHIPPING_THRESHOLD = 2000
export const STANDARD_SHIPPING = 150

// ─── Pagination ───────────────────────────────────────────────────────────────

export const PRODUCTS_PER_PAGE = 12

// ─── Social Links ─────────────────────────────────────────────────────────────

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/thediecastcornernepal',
  tiktok: 'https://tiktok.com/@thediecastcornernepal',
  facebook: 'https://facebook.com/thediecastcornernepal',
} as const
