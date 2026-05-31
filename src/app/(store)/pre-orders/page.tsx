import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getProducts } from '@/lib/supabase/queries/products'
import { ProductGrid } from '@/components/store/ProductGrid'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { PRODUCTS_PER_PAGE } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Pre-Orders — The Diecast Corner Nepal',
  description: 'Reserve upcoming diecast models from MiniGT, Tomica, and more. Be the first to get the latest releases.',
}

export const revalidate = 60

export default async function PreOrdersPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams
  const page = Number(searchParams.page ?? 1)

  const { products, count } = await getProducts({
    status: 'PRE_ORDER',
    page,
    limit: PRODUCTS_PER_PAGE,
  })

  const totalPages = Math.ceil(count / PRODUCTS_PER_PAGE)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl sm:text-5xl text-white tracking-widest uppercase">
          Pre-Order Zone
        </h1>
        <p className="text-brand-gold text-sm mt-3 font-medium tracking-wide">
          BE THE FIRST TO OWN THE LATEST RELEASES
        </p>
      </div>

      {products.length === 0 ? (
        <div className="bg-surface-card rounded-2xl border border-surface-border p-20 text-center">
          <p className="text-text-muted">No upcoming pre-orders at the moment. Check back soon!</p>
        </div>
      ) : (
        <>
          <Suspense fallback={
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }>
            <ProductGrid initialProducts={products} />
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1
                return (
                  <a
                    key={p}
                    href={`/pre-orders?page=${p}`}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-brand-gold text-black'
                        : 'bg-surface-elevated text-text-muted hover:text-white'
                    }`}
                  >
                    {p}
                  </a>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
