# Dependency Graph — The Diecast Corner Nepal
> Last updated: 2026-05-18 | Reflects rich media, banners, and bulk product import additions

## 1. NPM Package Dependencies

### Runtime Dependencies

```mermaid
graph TD
  APP["diecastcornernepal<br/>(Next.js 16.2.6)"]

  subgraph Framework ["⚛️ Framework"]
    NEXT["next@16.2.6"]
    REACT["react@19.2.4"]
    REACTDOM["react-dom@19.2.4"]
    NEXTTHEMES["next-themes@0.4.6"]
  end

  subgraph UI ["🎨 UI Layer"]
    RADIX_DIALOG["@radix-ui/react-dialog"]
    RADIX_DROPDOWN["@radix-ui/react-dropdown-menu"]
    RADIX_SELECT["@radix-ui/react-select"]
    RADIX_SLIDER["@radix-ui/react-slider"]
    RADIX_TOAST["@radix-ui/react-toast"]
    LUCIDE["lucide-react@1.14.0"]
    EMBLA["embla-carousel-react@8.6.0"]
    EMBLA_AUTO["embla-carousel-autoplay@8.6.0 ✨NEW"]
    REACT_SOCIAL["react-social-media-embed@2.5.18 ✨NEW"]
    CVA["class-variance-authority@0.7.1"]
    CLSX["clsx@2.1.1"]
    TWMERGE["tailwind-merge@3.6.0"]
  end

  subgraph Backend ["🗄️ Backend / Data"]
    SB_SSR["@supabase/ssr@0.10.3"]
    SB_JS["@supabase/supabase-js@2.105.4"]
    SWR["swr@2.4.1"]
  end

  subgraph State ["🔄 State Management"]
    ZUSTAND["zustand@5.0.13"]
  end

  subgraph Forms ["📋 Forms & Validation"]
    RHF["react-hook-form@7.75.0"]
    RHF_RESOLVERS["@hookform/resolvers@5.2.2"]
    ZOD["zod@4.4.3"]
  end

  APP --> Framework
  APP --> UI
  APP --> Backend
  APP --> State
  APP --> Forms

  SB_SSR --> SB_JS
  RHF_RESOLVERS --> ZOD
  RHF_RESOLVERS --> RHF
```

### Dev Dependencies

```mermaid
graph TD
  APP["diecastcornernepal"]

  subgraph Dev ["🔧 Dev / Build"]
    TS["typescript@^5"]
    TAILWIND["tailwindcss@^4"]
    POSTCSS["@tailwindcss/postcss@^4"]
    ESLINT["eslint@^9"]
    ESLINT_NEXT["eslint-config-next@16.2.6"]
    T_NODE["@types/node@^20"]
    T_REACT["@types/react@^19"]
    T_REACTDOM["@types/react-dom@^19"]
  end

  APP --> Dev
```

---

## 2. Internal Module Dependency Graph

### Core Architecture

```mermaid
graph TD
  subgraph AppShell ["🏠 App Shell"]
    LAYOUT["src/app/layout.tsx"]
    GLOBALS["src/app/globals.css"]
  end

  subgraph Pages_Store ["🛒 Store Routes (store)"]
    HOME["(store)/page.tsx — Homepage"]
    SHOP["(store)/shop/page.tsx"]
    PRODUCT["(store)/product/[slug]/page.tsx"]
    CART["(store)/cart/page.tsx"]
    CHECKOUT["(store)/checkout/page.tsx 🔧UPDATED"]
    ORDER_SUCCESS["(store)/order/success/[id]/page.tsx"]
    BRANDS["(store)/brands/page.tsx"]
    NEW_ARRIVALS["(store)/new-arrivals/page.tsx"]
    TREASURE["(store)/treasure-hunt/page.tsx"]
    STORE_LAYOUT["(store)/layout.tsx"]
  end

  subgraph Pages_Auth ["🔐 Auth Routes (auth)"]
    LOGIN["(auth)/login/page.tsx"]
    REGISTER["(auth)/register/page.tsx"]
    AUTH_LAYOUT["(auth)/layout.tsx"]
  end

  subgraph Pages_Account ["👤 Account Routes (account)"]
    ACCOUNT["(account)/account/page.tsx"]
    WISHLIST["(account)/account/wishlist/page.tsx"]
    ACC_LAYOUT["(account)/layout.tsx"]
  end

  subgraph Pages_Admin ["⚙️ Admin Routes"]
    ADMIN_HOME["admin/page.tsx"]
    ADMIN_PRODUCTS["admin/products/page.tsx 🔧UPDATED"]
    ADMIN_PROD_NEW["admin/products/new/page.tsx"]
    ADMIN_PROD_EDIT["admin/products/[id]/edit/page.tsx"]
    ADMIN_ORDERS["admin/orders/page.tsx"]
    ADMIN_ORDER_DETAIL["admin/orders/[id]/page.tsx"]
    ADMIN_CATEGORIES["admin/categories/page.tsx"]
    ADMIN_CAT_NEW["admin/categories/new/page.tsx"]
    ADMIN_CAT_EDIT["admin/categories/[id]/edit/page.tsx"]
    ADMIN_ANALYTICS["admin/analytics/page.tsx"]
    ADMIN_SETTINGS["admin/settings/page.tsx"]
    ADMIN_BANNERS["admin/banners/page.tsx ✨NEW"]
    ADMIN_MEDIA["admin/media/page.tsx ✨NEW"]
    ADMIN_LAYOUT["admin/layout.tsx"]
  end

  subgraph API ["📡 API Routes & Actions"]
    API_ORDERS["api/orders/route.ts"]
    API_KHALTI_INIT["api/payment/khalti/initiate/route.ts"]
    API_KHALTI_VERIFY["api/payment/khalti/verify/route.ts"]
    API_KHALTI_WEBHOOK["api/payment/khalti/webhook/route.ts"]
    API_CART_SYNC["api/cart/sync/route.ts"]
    API_AUTH_CALLBACK["api/auth/callback/route.ts"]
    API_AUTH_SIGNOUT["api/auth/signout/route.ts"]
    API_WISHLIST["api/wishlist/route.ts"]
    API_WISHLIST_SYNC["api/wishlist/sync/route.ts"]
    ACTION_BULK_IMPORT["admin/products/actions.ts ✨NEW"]
  end

  subgraph Components_Layout ["🧱 Layout Components"]
    NAVBAR["components/layout/Navbar.tsx"]
    FOOTER["components/layout/Footer.tsx"]
    ANNOUNCEMENT["components/layout/AnnouncementBar.tsx"]
  end

  subgraph Components_Home ["🏡 Home Components"]
    HERO["components/home/HeroSection.tsx"]
    BANNER_CAROUSEL["components/home/BannerCarousel.tsx ✨NEW"]
    BANNER_SLIDE["components/home/BannerSlide.tsx ✨NEW"]
    FEATURED["components/home/FeaturedDrops.tsx"]
    NEW_ARR_COMP["components/home/NewArrivals.tsx"]
    SOCIAL["components/home/SocialStrip.tsx"]
    COLL_MEDIA_GALLERY["components/home/CollectorMediaGallery.tsx ✨NEW"]
    TREASURE_COMP["components/home/TreasureHuntZone.tsx"]
    WHY_US["components/home/WhyChooseUs.tsx"]
  end

  subgraph Components_Store ["🏪 Store Components"]
    CART_DRAWER["components/store/CartDrawer.tsx"]
    PRODUCT_CARD["components/store/ProductCard.tsx"]
    PRODUCT_GALLERY["components/store/ProductGallery.tsx"]
    PRODUCT_MEDIA["components/store/ProductMediaGallery.tsx ✨NEW"]
    PRODUCT_GRID["components/store/ProductGrid.tsx"]
    SHOP_FILTERS["components/store/ShopFilters.tsx"]
    ADD_TO_CART_BTN["components/store/AddToCartDetailButton.tsx"]
  end

  subgraph Components_Admin ["🛠️ Admin Components"]
    ORDER_STATUS["components/admin/OrderStatusUpdater.tsx"]
    PRODUCT_FORM["components/admin/ProductForm.tsx"]
    PRODUCT_BULK_IMPORT["components/admin/ProductBulkImport.tsx ✨NEW"]
    PRODUCT_MEDIA_MANAGER["components/admin/ProductMediaManager.tsx ✨NEW"]
    SOCIAL_GALLERY_MANAGER["components/admin/SocialGalleryManager.tsx ✨NEW"]
    BANNER_FORM["components/admin/BannerForm.tsx ✨NEW"]
    CATEGORY_FORM["components/admin/CategoryForm.tsx"]
  end

  subgraph Components_UI ["🎨 UI Primitives"]
    BADGE["components/ui/badge.tsx"]
    BUTTON["components/ui/button.tsx"]
    INPUT["components/ui/input.tsx"]
    SKELETON["components/ui/skeleton.tsx"]
    VIDEO_EMBED["components/ui/VideoEmbed.tsx ✨NEW"]
    MEDIA_CARD["components/ui/MediaCard.tsx ✨NEW"]
  end

  subgraph Stores ["📦 Zustand Stores"]
    CART_STORE["store/cartStore.ts"]
    UI_STORE["store/uiStore.ts"]
    WISHLIST_STORE["store/wishlistStore.ts"]
  end

  subgraph Lib ["📚 Lib / Shared"]
    SB_CLIENT["lib/supabase/client.ts"]
    SB_SERVER["lib/supabase/server.ts"]
    Q_PRODUCTS["lib/supabase/queries/products.ts"]
    Q_CATEGORIES["lib/supabase/queries/categories.ts"]
    Q_ORDERS["lib/supabase/queries/orders.ts"]
    Q_BANNERS["lib/supabase/queries/banners.ts ✨NEW"]
    Q_MEDIA["lib/supabase/queries/media.ts ✨NEW"]
    Q_ANALYTICS["lib/supabase/queries/analytics.ts"]
    TYPES_PRODUCT["lib/types/product.ts"]
    TYPES_MEDIA["lib/types/media.ts ✨NEW"]
    UTILS["lib/utils.ts"]
    CONSTANTS["lib/constants.ts 🔧UPDATED"]
  end

  subgraph Static ["📁 Static Assets"]
    PLACEHOLDER["public/placeholder-car.jpg"]
    CSV_TEMPLATE["public/products_template.csv ✨NEW"]
    LOGO_KHALTI["public/logos/khalti.png ✨NEW"]
    LOGO_ESEWA["public/logos/esewa.png ✨NEW"]
  end

  %% App Shell
  LAYOUT --> NAVBAR
  LAYOUT --> FOOTER
  LAYOUT --> ANNOUNCEMENT
  LAYOUT --> CART_DRAWER

  %% Home page integration
  HOME --> BANNER_CAROUSEL
  HOME --> FEATURED
  HOME --> COLL_MEDIA_GALLERY
  HOME --> NEW_ARR_COMP

  %% Store UI
  SHOP --> PRODUCT_GRID
  PRODUCT_GRID --> PRODUCT_CARD
  PRODUCT --> PRODUCT_MEDIA
  PRODUCT --> ADD_TO_CART_BTN
  CHECKOUT --> LOGO_KHALTI
  CHECKOUT --> LOGO_ESEWA

  %% Admin Bulk Import
  ADMIN_PRODUCTS --> PRODUCT_BULK_IMPORT
  PRODUCT_BULK_IMPORT --> ACTION_BULK_IMPORT
  PRODUCT_BULK_IMPORT --> CSV_TEMPLATE
  
  %% Media & Banner Admin
  ADMIN_BANNERS --> BANNER_FORM
  ADMIN_MEDIA --> SOCIAL_GALLERY_MANAGER
  ADMIN_PROD_EDIT --> PRODUCT_MEDIA_MANAGER
  PRODUCT_MEDIA_MANAGER --> Q_MEDIA

  %% UI primitives used
  PRODUCT_CARD --> BADGE
  PRODUCT_MEDIA --> VIDEO_EMBED
  COLL_MEDIA_GALLERY --> MEDIA_CARD
  BANNER_CAROUSEL --> EMBLA_AUTO

  %% Zustand stores
  NAVBAR --> CART_STORE
  PRODUCT_CARD --> CART_STORE
  PRODUCT_CARD --> WISHLIST_STORE

  %% Queries → Supabase clients
  Q_PRODUCTS --> SB_SERVER
  Q_BANNERS --> SB_SERVER
  Q_MEDIA --> SB_SERVER
  SB_CLIENT --> SUPABASE_JS[("@supabase/supabase-js")]
  SB_SERVER --> SUPABASE_SSR[("@supabase/ssr")]
```

---

## 3. Data Flow Diagram

```mermaid
flowchart LR
  USER["👤 User / Browser"]

  subgraph Client ["Client Side"]
    PAGE["Next.js Page/Component"]
    SWR_HOOK["SWR Hook"]
    ZUSTAND["Zustand Store<br/>(cartStore / uiStore)"]
    RHF["React Hook Form<br/>+ Zod Validation"]
  end

  subgraph Server ["Server Side (RSC / API Routes / Actions)"]
    RSC["React Server Component"]
    API_RT["API Route Handler / Server Action"]
    SB_SRV["Supabase Server Client<br/>(@supabase/ssr)"]
    SB_CLI["Supabase Browser Client<br/>(@supabase/supabase-js)"]
  end

  subgraph External ["External Services"]
    SUPABASE[("Supabase<br/>Postgres + Auth + Storage")]
    KHALTI["Khalti<br/>Payment Gateway"]
    TIKTOK["TikTok / Insta<br/>(Embeds)"]
  end

  USER --> PAGE
  PAGE --> SWR_HOOK
  SWR_HOOK --> API_RT
  PAGE --> RSC
  RSC --> SB_SRV
  API_RT --> SB_SRV
  API_RT --> KHALTI
  SB_SRV --> SUPABASE
  SB_CLI --> SUPABASE
  PAGE --> ZUSTAND
  PAGE --> RHF
  RHF --> API_RT
  RHF --> SB_CLI
  ZUSTAND --> SB_CLI
  PAGE --> TIKTOK
```

---

## 4. Database Schema & RLS Policy Map

```mermaid
graph TD
  subgraph Tables ["📊 Supabase Tables"]
    T_PROFILES["profiles"]
    T_PRODUCTS["products"]
    T_PRODUCT_IMAGES["product_images"]
    T_PRODUCT_VIDEOS["product_videos ✨NEW"]
    T_CATEGORIES["categories"]
    T_BANNERS["banners ✨NEW"]
    T_SOCIAL_GALLERY["social_gallery ✨NEW"]
    T_ORDERS["orders"]
    T_CART_ITEMS["cart_items"]
    T_WISHLIST["wishlist_items ✨NEW"]
  end

  subgraph RLS ["🔒 RLS Access Rules"]
    PUBLIC_READ["Public: SELECT only"]
    USER_OWN["User: own rows only"]
    ADMIN_ALL["Admin: full CRUD<br/>(role='admin' in profiles)"]
  end

  T_PRODUCTS --> PUBLIC_READ
  T_PRODUCTS --> ADMIN_ALL
  T_PRODUCT_IMAGES --> PUBLIC_READ
  T_PRODUCT_IMAGES --> ADMIN_ALL
  T_PRODUCT_VIDEOS --> PUBLIC_READ
  T_PRODUCT_VIDEOS --> ADMIN_ALL
  T_CATEGORIES --> PUBLIC_READ
  T_CATEGORIES --> ADMIN_ALL
  T_BANNERS --> PUBLIC_READ
  T_BANNERS --> ADMIN_ALL
  T_SOCIAL_GALLERY --> PUBLIC_READ
  T_SOCIAL_GALLERY --> ADMIN_ALL
  T_PROFILES --> USER_OWN
  T_ORDERS --> USER_OWN
  T_ORDERS --> ADMIN_ALL
  T_CART_ITEMS --> USER_OWN
  T_WISHLIST --> USER_OWN
```

---

## 5. Summary Table

| Layer | Modules |
|---|---|
| **Pages (Store)** | `/`, `/shop`, `/product/[slug]`, `/cart`, `/checkout` 🔧, `/brands`, `/new-arrivals`, `/treasure-hunt` |
| **Pages (Admin)** | `/admin`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`, `/admin/orders`, `/admin/banners` ✨, `/admin/media` ✨, `/admin/categories` |
| **API & Actions** | `api/orders`, `api/payment/khalti/*`, `api/wishlist/*`, `admin/products/actions.ts` ✨ |
| **Home Components** | `HeroSection`, `BannerCarousel` ✨, `FeaturedDrops`, `CollectorMediaGallery` ✨, `TreasureHuntZone` |
| **Store Components** | `CartDrawer`, `ProductCard`, `ProductMediaGallery` ✨, `ProductGrid`, `ShopFilters`, `AddToCartDetailButton` |
| **Admin Components** | `ProductBulkImport` ✨, `ProductMediaManager` ✨, `SocialGalleryManager` ✨, `BannerForm` ✨, `OrderStatusUpdater`, `ProductForm`, `CategoryForm` |
| **UI Primitives** | `Badge`, `Button`, `Input`, `Skeleton`, `VideoEmbed` ✨, `MediaCard` ✨ |
| **State (Zustand)** | `cartStore`, `uiStore`, `wishlistStore` |
| **Data Layer** | `lib/supabase/queries/` — products, categories, orders, banners ✨, media ✨ |
| **Types** | `lib/types/product.ts`, `lib/types/media.ts` ✨, `lib/types/order.ts`, `lib/types/api.ts` |
| **Shared Utils** | `lib/utils.ts`, `lib/constants.ts` 🔧 |
| **Static Assets** | `public/placeholder-car.jpg`, `public/products_template.csv` ✨, `public/logos/khalti.png` ✨, `public/logos/esewa.png` ✨ |

**Legend:** ✨ New since last graph &nbsp;|&nbsp; 🔧 Modified since last graph
