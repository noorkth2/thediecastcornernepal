import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { ProductCard } from '@/components/store/ProductCard'
import type { Product } from '@/lib/types'

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch wishlist items with product details
  const { data: wishlistItems } = await supabase
    .from('wishlist_items')
    .select(`
      id,
      product_id,
      products (
        id,
        title,
        slug,
        price,
        compare_price,
        brand,
        stock_qty,
        is_active,
        image_url,
        product_images (
          image_url,
          alt_text,
          is_primary
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const items = wishlistItems?.map((item) => {
    const p = item.products as any
    return {
      wishlist_id: item.id,
      product: {
        ...p,
        images: p?.product_images,
      } as unknown as Product,
    }
  }) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white tracking-wide flex items-center gap-3">
          <Heart className="w-8 h-8 text-brand-red" />
          MY WISHLIST
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Items you've saved for later.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-surface-card rounded-xl border border-surface-border p-12 text-center">
          <Heart className="w-12 h-12 text-surface-border mx-auto mb-4" />
          <p className="text-text-muted text-lg mb-2">Your wishlist is empty</p>
          <Link href="/shop" className="text-brand-red hover:text-brand-red-light font-medium transition-colors">
            Discover products →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <ProductCard key={item.wishlist_id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  )
}
