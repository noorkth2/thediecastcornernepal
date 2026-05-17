import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getRelatedProducts } from '@/lib/supabase/queries/products'
import { ProductGallery } from '@/components/store/ProductGallery'
import { ProductCard } from '@/components/store/ProductCard'
import { AddToCartDetailButton } from '@/components/store/AddToCartDetailButton'
import { Badge } from '@/components/ui/badge'
import { formatPrice, discountPercent } from '@/lib/utils'
import { Package, Tag, Layers } from 'lucide-react'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const params = await props.params
  const { product } = await getProductBySlug(params.slug)
  if (!product) return { title: 'Product Not Found' }

  const primaryImage = product.images?.find((i) => i.is_primary)

  return {
    title: `${product.title} | The Diecast Corner Nepal`,
    description:
      product.description?.slice(0, 160) ??
      `Buy ${product.title}${product.brand ? ` by ${product.brand}` : ''}${product.scale ? ` (${product.scale})` : ''} diecast model at The Diecast Corner Nepal.`,
    openGraph: {
      title: product.title,
      description: product.description ?? '',
      images: primaryImage ? [{ url: primaryImage.image_url }] : [],
    },
  }
}

export async function generateStaticParams() {
  const { createClient: createRawClient } = await import('@supabase/supabase-js')
  const supabase = createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('products')
    .select('slug')
    .eq('is_active', true)
  return data?.map(({ slug }: { slug: string }) => ({ slug })) ?? []
}

export const revalidate = 60

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params
  const { product } = await getProductBySlug(params.slug)
  if (!product) notFound()

  const related = product.category_id
    ? await getRelatedProducts(product.id, product.category_id, 4)
    : []

  const discount = discountPercent(product.price, product.compare_price ?? 0)
  const isOutOfStock = product.stock_qty === 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-text-faint mb-8 flex items-center gap-2" aria-label="Breadcrumb">
        <a href="/" className="hover:text-white transition-colors">Home</a>
        <span>/</span>
        <a href="/shop" className="hover:text-white transition-colors">Shop</a>
        {product.category && (
          <>
            <span>/</span>
            <a
              href={`/shop?category=${product.category.slug}`}
              className="hover:text-white transition-colors"
            >
              {product.category.name}
            </a>
          </>
        )}
        <span>/</span>
        <span className="text-text-muted line-clamp-1">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <ProductGallery images={product.images ?? []} title={product.title} imageUrlFallback={product.image_url} />

        {/* Product Info */}
        <div>
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.is_treasure_hunt && <span className="badge-th">⭐ Treasure Hunt</span>}
            {product.is_limited && <span className="badge-limited">🔥 Limited Edition</span>}
            {product.is_new_arrival && <Badge variant="blue">New Arrival</Badge>}
            {product.is_premium && <Badge variant="gold">Premium</Badge>}
            {isOutOfStock && <Badge variant="red">Out of Stock</Badge>}
          </div>

          {/* Brand */}
          {product.brand && (
            <p className="text-sm text-text-muted uppercase tracking-widest font-medium mb-1">
              {product.brand}
            </p>
          )}

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide leading-tight mb-4">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-bold text-brand-gold">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <>
                <span className="text-text-faint text-lg line-through">
                  {formatPrice(product.compare_price)}
                </span>
                <span className="text-sm font-bold text-brand-red bg-brand-red/10 px-2 py-0.5 rounded">
                  -{discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <p className={`text-sm mb-6 font-medium ${
            isOutOfStock
              ? 'text-red-400'
              : product.stock_qty <= 5
              ? 'text-orange-400'
              : 'text-green-400'
          }`}>
            {isOutOfStock
              ? '✗ Out of Stock'
              : product.stock_qty <= 5
              ? `⚠ Only ${product.stock_qty} left in stock`
              : `✓ In Stock (${product.stock_qty} available)`}
          </p>

          {/* Specs */}
          <div className="flex flex-wrap gap-3 mb-6">
            {product.scale && (
              <div className="flex items-center gap-1.5 bg-surface-elevated rounded-lg px-3 py-1.5 text-sm">
                <Layers className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-text-muted">Scale:</span>
                <span className="text-text-primary font-medium">{product.scale}</span>
              </div>
            )}
            {product.series && (
              <div className="flex items-center gap-1.5 bg-surface-elevated rounded-lg px-3 py-1.5 text-sm">
                <Tag className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-text-muted">Series:</span>
                <span className="text-text-primary font-medium">{product.series}</span>
              </div>
            )}
            {product.category && (
              <div className="flex items-center gap-1.5 bg-surface-elevated rounded-lg px-3 py-1.5 text-sm">
                <Package className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-text-primary font-medium">{product.category.name}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6 text-text-muted text-sm leading-relaxed border-t border-surface-border pt-4">
              {product.description}
            </div>
          )}

          {/* Add to cart — Client Component */}
          <AddToCartDetailButton product={product} />

          {/* Shipping note */}
          <div className="mt-5 p-3.5 bg-surface-elevated rounded-xl border border-surface-border text-xs text-text-muted flex items-start gap-2">
            <span>🚚</span>
            <span>
              Free shipping on orders over Rs. 2,000. Standard shipping Rs. 150.
              Delivered within 2–5 business days across Nepal.
            </span>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-3xl text-white tracking-wide mb-6">
            YOU MIGHT ALSO LIKE
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


