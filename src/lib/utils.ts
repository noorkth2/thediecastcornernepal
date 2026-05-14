import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes safely, resolving conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Nepali Rupees.
 * e.g. 1500 → "Rs. 1,500"
 */
export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-IN')}`
}

/**
 * Generate a short unique order code.
 * e.g. "DCN-482931"
 */
export function generateOrderCode(): string {
  return `DCN-${Date.now().toString().slice(-6)}`
}

/**
 * Get the primary image URL from a product's images array.
 * Falls back to the first image, then a placeholder.
 */
export function getPrimaryImage(
  images?: { image_url: string; is_primary: boolean }[]
): string {
  if (!images || images.length === 0) return '/placeholder-car.jpg'
  const primary = images.find((i) => i.is_primary)
  return primary?.image_url ?? images[0].image_url
}

/**
 * Calculate discount percentage between two prices.
 */
export function discountPercent(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

/**
 * Truncate text to a given max length with ellipsis.
 */
export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

/**
 * Convert a string to a URL-safe slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Format a date string to a readable format.
 * e.g. "2024-01-15T10:00:00Z" → "Jan 15, 2024"
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Check if a banner is currently active based on display dates.
 */
export function isBannerActive(
  displayStart: string | null,
  displayEnd: string | null
): boolean {
  const now = new Date()
  if (displayStart && new Date(displayStart) > now) return false
  if (displayEnd && new Date(displayEnd) < now) return false
  return true
}
