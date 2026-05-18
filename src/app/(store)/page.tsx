import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { BannerCarousel } from '@/components/home/BannerCarousel'
import { FeaturedDrops } from '@/components/home/FeaturedDrops'
import { CollectorMediaGallery } from '@/components/home/CollectorMediaGallery'
import { TreasureHuntZone } from '@/components/home/TreasureHuntZone'
import { NewArrivals } from '@/components/home/NewArrivals'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { SocialStrip } from '@/components/home/SocialStrip'
import { getFeaturedProducts, getNewArrivals, getTreasureHuntProducts } from '@/lib/supabase/queries/products'
import { getActiveFeaturedBanners } from '@/lib/supabase/queries/banners'
import { getSocialGallery } from '@/lib/supabase/queries/media'

export const metadata: Metadata = {
  title: 'The Diecast Corner Nepal — MiniGT, Tomica & Collectibles',
  description:
    "Nepal's premier diecast collectibles store. Shop MiniGT, Tomica, Matchbox, Greenlight and exclusive limited edition finds.",
}

export const revalidate = 60

export default async function HomePage() {
  const [featured, newArrivals, treasureHunts, banners, { gallery }] = await Promise.all([
    getFeaturedProducts(8),
    getNewArrivals(8),
    getTreasureHuntProducts(4),
    getActiveFeaturedBanners(),
    getSocialGallery(12),
  ])

  return (
    <>
      <BannerCarousel banners={banners} />
      <FeaturedDrops products={featured} />
      <CollectorMediaGallery items={gallery} />
      <TreasureHuntZone products={treasureHunts} />
      <NewArrivals products={newArrivals} />
      <WhyChooseUs />
      <SocialStrip />
    </>
  )
}
