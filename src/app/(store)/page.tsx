import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedDrops } from '@/components/home/FeaturedDrops'
import { TreasureHuntZone } from '@/components/home/TreasureHuntZone'
import { NewArrivals } from '@/components/home/NewArrivals'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { SocialStrip } from '@/components/home/SocialStrip'
import { getFeaturedProducts, getNewArrivals, getTreasureHuntProducts } from '@/lib/supabase/queries/products'

export const metadata: Metadata = {
  title: 'The Diecast Corner Nepal — Hot Wheels, MiniGT & Collectibles',
  description:
    "Nepal's premier diecast collectibles store. Shop Hot Wheels, MiniGT, Matchbox, Tomica and exclusive Treasure Hunts.",
}

export const revalidate = 60

export default async function HomePage() {
  const [featured, newArrivals, treasureHunts] = await Promise.all([
    getFeaturedProducts(8),
    getNewArrivals(8),
    getTreasureHuntProducts(4),
  ])

  return (
    <>
      <HeroSection />
      <FeaturedDrops products={featured} />
      <TreasureHuntZone products={treasureHunts} />
      <NewArrivals products={newArrivals} />
      <WhyChooseUs />
      <SocialStrip />
    </>
  )
}
