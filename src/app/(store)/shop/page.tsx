import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getProducts } from '@/lib/supabase/queries/products'
import { getCategories } from '@/lib/supabase/queries/categories'
import { getActiveBrands } from '@/lib/supabase/queries/brands'
import { ProductGrid } from '@/components/store/ProductGrid'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { ShopFilters } from '@/components/store/ShopFilters'
import { PRODUCTS_PER_PAGE } from '@/lib/constants'

export const revalidate = 60

interface ShopPageProps {
  searchParams: Promise<{
    category?: string
    brand?: string
    min?: string
    max?: string
    sort?: string
    q?: string
    page?: string
  }>
}

export async function generateMetadata(props: ShopPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams
  const { category, brand, q } = searchParams

  let title = 'Shop — Browse All Diecast Models'
  let description = 'Browse our full collection of MiniGT, Tomica, Matchbox, Greenlight and premium diecast models. Filter by brand, price, and more.'

  if (q) {
    title = `Search results for "${q}"`
    description = `Viewing products matching your search for "${q}" at The Diecast Corner Nepal.`
  } else if (category) {
    // Capitalize slug for title (simple approach)
    const catName = category.charAt(0).toUpperCase() + category.slice(1)
    title = `${catName} Models`
    description = `Explore our collection of ${catName} diecast models. Genuine quality collectibles available in Nepal.`
  } else if (brand) {
    title = `${brand} Models`
    description = `Shop the latest ${brand} scale models at The Diecast Corner Nepal. Fast delivery across Nepal.`
  }

  return { title, description }
}

export default async function ShopPage(props: ShopPageProps) {
  const searchParams = await props.searchParams
  const page = Number(searchParams.page ?? 1)

  const [{ products, count }, { categories }, brands] = await Promise.all([
    getProducts({
      category: searchParams.category,
      brand: searchParams.brand,
      minPrice: searchParams.min ? Number(searchParams.min) : undefined,
      maxPrice: searchParams.max ? Number(searchParams.max) : undefined,
      sort: (searchParams.sort as 'newest' | 'price_asc' | 'price_desc' | 'name_asc') ?? 'newest',
      search: searchParams.q,
      page,
      limit: PRODUCTS_PER_PAGE,
    }),
    getCategories(),
    getActiveBrands(),
  ])

  const totalPages = Math.ceil(count / PRODUCTS_PER_PAGE)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white tracking-wide">
          {searchParams.q
            ? `Search: "${searchParams.q}"`
            : searchParams.category
            ? categories.find((c) => c.slug === searchParams.category)?.name ?? 'Shop'
            : 'SHOP ALL'}
        </h1>
        <p className="text-text-muted text-sm mt-1">
          {count} product{count !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <ShopFilters
            categories={categories}
            brands={brands}
            currentFilters={{
              category: searchParams.category,
              brand: searchParams.brand,
              min: searchParams.min,
              max: searchParams.max,
              sort: searchParams.sort,
              q: searchParams.q,
            }}
          />
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <Suspense
            key={JSON.stringify(await props.searchParams)}
            fallback={
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(12)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <ProductGrid initialProducts={products} />
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1
                const cleanParams = Object.fromEntries(
                  Object.entries(searchParams).filter(([_, v]) => v != null)
                )
                const params = new URLSearchParams({
                  ...cleanParams,
                  page: String(p),
                })
                return (
                  <a
                    key={p}
                    href={`/shop?${params}`}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-brand-red text-white'
                        : 'bg-surface-elevated text-text-muted hover:text-white hover:bg-surface-border'
                    }`}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? 'page' : undefined}
                  >
                    {p}
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
