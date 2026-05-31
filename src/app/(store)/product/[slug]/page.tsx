import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getRelatedProducts } from '@/lib/supabase/queries/products'
import { getProductMedia } from '@/lib/supabase/queries/media'
import { getProductVariants } from '@/lib/supabase/queries/variants'
import { getProductPreorderConfigs } from '@/lib/supabase/queries/preorders'
import { getAlsoBought } from '@/lib/supabase/queries/recommendations'
import { getReviewsByProduct } from '@/lib/supabase/queries/reviews'
import { ProductMediaGallery } from '@/components/store/ProductMediaGallery'
import { ProductCard } from '@/components/store/ProductCard'
import { RecommendationRail } from '@/components/store/RecommendationRail'
import { ProductClientActions } from '@/components/store/ProductClientActions'
import { ProductReviews } from '@/components/store/ProductReviews'
import { WaitlistForm } from '@/components/store/WaitlistForm'
import { Badge } from '@/components/ui/badge'
import { formatPrice, discountPercent } from '@/lib/utils'
import { Package, Tag, Layers } from 'lucide-react'
import { JsonLd, buildProductSchema, buildBreadcrumbSchema } from '@/components/seo/JsonLd'
import { getNonce } from '@/lib/csp'
import { createClient } from '@/lib/supabase/server'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const params = await props.params
  const { product } = await getProductBySlug(params.slug)
  
  if (!product) return { title: 'Product Not Found' }

  const primaryImage = product.images?.find((i) => i.is_primary)?.image_url ?? product.image_url
  const description = product.description 
    ? product.description.slice(0, 160) 
    : `Shop ${product.title} ${product.brand ? `by ${product.brand}` : ''}. Premium diecast scale model collectible available at The Diecast Corner Nepal.`

  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      images: primaryImage ? [{ url: primaryImage }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
  }
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params
  const { product } = await getProductBySlug(params.slug)
  if (!product) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [related, { media }, variants, preorderConfigs, alsoBought, { reviews }] = await Promise.all([
    product.category_id ? getRelatedProducts(product.id, product.category_id, 4) : Promise.resolve([]),
    getProductMedia(product.id),
    getProductVariants(product.id),
    getProductPreorderConfigs(product.id),
    getAlsoBought(product.id, 8),
    getReviewsByProduct(product.id)
  ])

  const discount = discountPercent(product.price, product.compare_price ?? 0)
  const isOutOfStock = product.stock_qty === 0
  const primaryImageUrl = product.images?.find((i) => i.is_primary)?.image_url ?? product.image_url

  const productSchema = buildProductSchema({
    title: product.title,
    description: product.description,
    brand: product.brand,
    price: product.price,
    comparePrice: product.compare_price,
    stockQty: product.stock_qty,
    imageUrl: primaryImageUrl,
    slug: product.slug,
  })

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://thediecastcornernepal.com' },
    { name: 'Shop', url: 'https://thediecastcornernepal.com/shop' },
    ...(product.category ? [{ name: product.category.name, url: `https://thediecastcornernepal.com/shop?category=${product.category.slug}` }] : []),
    { name: product.title, url: `https://thediecastcornernepal.com/product/${product.slug}` },
  ])

  const nonce = await getNonce()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={productSchema} nonce={nonce} />
      <JsonLd data={breadcrumbSchema} nonce={nonce} />
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
        <ProductMediaGallery images={product.images ?? []} media={media} title={product.title} imageUrlFallback={product.image_url} />

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
          <p className={`text-sm mb-6 font-medium ${isOutOfStock
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

          {/* Add to cart / Variant selection — Client Component */}
          <ProductClientActions product={product} variants={variants} preorderConfigs={preorderConfigs} />

          {/* Waitlist Form for Out of Stock items */}
          {isOutOfStock && (
            <div className="mt-6">
              <WaitlistForm productId={product.id} productTitle={product.title} />
            </div>
          )}

          {/* Shipping note */}
          <div className="mt-5 p-3.5 bg-surface-elevated rounded-xl border border-surface-border text-xs text-text-muted flex items-start gap-2">
            <span>🚚</span>
            <span>
              Free shipping on orders over Rs. 5,000. Standard shipping Rs. 150.
              Delivered within 2–5 business days across Nepal.
            </span>
          </div>
        </div>
      </div>

      {/* Recommendation Rails */}
      <div className="mt-20 space-y-16">
        {alsoBought.length > 0 && (
          <RecommendationRail
            products={alsoBought}
            title="Frequently Bought Together"
            subtitle="Other collectors bought these items alongside this model."
          />
        )}

        {related.length > 0 && (
          <RecommendationRail
            products={related}
            title="You Might Also Like"
            subtitle="More models from the same category."
          />
        )}
      </div>

      {/* Reviews Section */}
      <div className="mt-24">
        <ProductReviews 
          productId={product.id} 
          initialReviews={reviews} 
          userId={user?.id} 
        />
      </div>
    </div>
  )
}


