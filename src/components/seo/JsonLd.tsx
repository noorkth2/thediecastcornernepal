/**
 * JsonLd — Injects structured data (JSON-LD) into the document head.
 * Zero client JS — renders as a static <script> tag in the RSC render.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// ─── Schema builders ──────────────────────────────────────────────────────────

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Diecast Corner Nepal',
    url: 'https://thediecastcornernepal.com',
    logo: 'https://thediecastcornernepal.com/logo.png',
    sameAs: [
      'https://instagram.com/thediecastcornernepal',
      'https://tiktok.com/@thediecastcornernepal',
      'https://facebook.com/thediecastcornernepal',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      areaServed: 'NP',
      availableLanguage: ['English', 'Nepali'],
    },
  }
}

interface ProductSchemaOptions {
  title: string
  description: string | null
  brand: string | null
  price: number
  comparePrice: number | null
  stockQty: number
  imageUrl: string | null
  slug: string
  sku?: string | null
}

export function buildProductSchema(p: ProductSchemaOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    description: p.description ?? undefined,
    sku: p.sku ?? p.slug,
    brand: p.brand
      ? { '@type': 'Brand', name: p.brand }
      : undefined,
    image: p.imageUrl ? [p.imageUrl] : undefined,
    offers: {
      '@type': 'Offer',
      url: `https://thediecastcornernepal.com/product/${p.slug}`,
      priceCurrency: 'NPR',
      price: p.price.toFixed(2),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      availability:
        p.stockQty > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'The Diecast Corner Nepal',
      },
    },
  }
}

export function buildBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Diecast Corner Nepal',
    url: 'https://thediecastcornernepal.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate:
          'https://thediecastcornernepal.com/shop?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
