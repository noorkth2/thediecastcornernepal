import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { CartDrawer } from '@/components/store/CartDrawer'
import { getBannersByType } from '@/lib/supabase/queries/banners'

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch announcement banner from Supabase
  const announcementBanners = await getBannersByType('announcement')
  const announcement = announcementBanners[0]

  return (
    <>
      <AnnouncementBar
        text={announcement?.announcement_text ?? undefined}
        isActive={!!announcement?.is_active}
      />
      <Navbar />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  )
}
