# Dependency Graph — The Diecast Corner Nepal
> Last updated: 2026-05-17 | Reflects post-rebranding & image-pipeline fixes

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
    CHECKOUT["(store)/checkout/page.tsx"]
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
    ACC_LAYOUT["(account)/layout.tsx"]
  end

  subgraph Pages_Admin ["⚙️ Admin Routes"]
    ADMIN_HOME["admin/page.tsx"]
    ADMIN_PRODUCTS["admin/products/page.tsx"]
    ADMIN_PROD_NEW["admin/products/new/page.tsx ✨NEW"]
    ADMIN_PROD_EDIT["admin/products/[id]/edit/page.tsx ✨NEW"]
    ADMIN_ORDERS["admin/orders/page.tsx"]
    ADMIN_ORDER_DETAIL["admin/orders/[id]/page.tsx ✨NEW"]
    ADMIN_CATEGORIES["admin/categories/page.tsx"]
    ADMIN_CAT_NEW["admin/categories/new/page.tsx ✨NEW"]
    ADMIN_CAT_EDIT["admin/categories/[id]/edit/page.tsx ✨NEW"]
    ADMIN_ANALYTICS["admin/analytics/page.tsx"]
    ADMIN_SETTINGS["admin/settings/page.tsx"]
    ADMIN_LAYOUT["admin/layout.tsx"]
  end

  subgraph API ["📡 API Routes"]
    API_ORDERS["api/orders/route.ts"]
    API_KHALTI_INIT["api/payment/khalti/initiate/route.ts"]
    API_KHALTI_VERIFY["api/payment/khalti/verify/route.ts"]
    API_KHALTI_WEBHOOK["api/payment/khalti/webhook/route.ts ✨NEW"]
    API_CART_SYNC["api/cart/sync/route.ts ✨NEW"]
    API_AUTH_CALLBACK["api/auth/callback/route.ts ✨NEW"]
    API_AUTH_SIGNOUT["api/auth/signout/route.ts ✨NEW"]
  end

  subgraph Components_Layout ["🧱 Layout Components"]
    NAVBAR["components/layout/Navbar.tsx"]
    FOOTER["components/layout/Footer.tsx"]
    ANNOUNCEMENT["components/layout/AnnouncementBar.tsx"]
  end

  subgraph Components_Home ["🏡 Home Components"]
    HERO["components/home/HeroSection.tsx"]
    FEATURED["components/home/FeaturedDrops.tsx"]
    NEW_ARR_COMP["components/home/NewArrivals.tsx"]
    SOCIAL["components/home/SocialStrip.tsx"]
    TREASURE_COMP["components/home/TreasureHuntZone.tsx"]
    WHY_US["components/home/WhyChooseUs.tsx"]
  end

  subgraph Components_Store ["🏪 Store Components"]
    CART_DRAWER["components/store/CartDrawer.tsx"]
    PRODUCT_CARD["components/store/ProductCard.tsx"]
    PRODUCT_GALLERY["components/store/ProductGallery.tsx 🔧UPDATED"]
    PRODUCT_GRID["components/store/ProductGrid.tsx"]
    SHOP_FILTERS["components/store/ShopFilters.tsx"]
    ADD_TO_CART_BTN["components/store/AddToCartDetailButton.tsx ✨NEW"]
  end

  subgraph Components_Admin ["🛠️ Admin Components"]
    ORDER_STATUS["components/admin/OrderStatusUpdater.tsx"]
    PRODUCT_FORM["components/admin/ProductForm.tsx 🔧UPDATED"]
    CATEGORY_FORM["components/admin/CategoryForm.tsx ✨NEW"]
  end

  subgraph Components_UI ["🎨 UI Primitives"]
    BADGE["components/ui/badge.tsx"]
    BUTTON["components/ui/button.tsx"]
    INPUT["components/ui/input.tsx"]
    SKELETON["components/ui/skeleton.tsx"]
  end

  subgraph Stores ["📦 Zustand Stores"]
    CART_STORE["store/cartStore.ts"]
    UI_STORE["store/uiStore.ts"]
  end

  subgraph Lib ["📚 Lib / Shared"]
    SB_CLIENT["lib/supabase/client.ts"]
    SB_SERVER["lib/supabase/server.ts"]
    Q_PRODUCTS["lib/supabase/queries/products.ts"]
    Q_CATEGORIES["lib/supabase/queries/categories.ts"]
    Q_ORDERS["lib/supabase/queries/orders.ts"]
    Q_BANNERS["lib/supabase/queries/banners.ts"]
    Q_ANALYTICS["lib/supabase/queries/analytics.ts ✨NEW"]
    TYPES_PRODUCT["lib/types/product.ts 🔧UPDATED"]
    TYPES_ORDER["lib/types/order.ts ✨NEW"]
    TYPES_API["lib/types/api.ts ✨NEW"]
    UTILS["lib/utils.ts 🔧UPDATED"]
    CONSTANTS["lib/constants.ts"]
    VAL_AUTH["lib/validations/auth.ts"]
    VAL_CHECKOUT["lib/validations/checkout.ts"]
    VAL_PRODUCT["lib/validations/product.ts"]
    PROXY["src/proxy.ts"]
  end

  subgraph Static ["📁 Static Assets"]
    PLACEHOLDER["public/placeholder-car.jpg ✨NEW"]
  end

  %% App Shell
  LAYOUT --> NAVBAR
  LAYOUT --> FOOTER
  LAYOUT --> ANNOUNCEMENT
  LAYOUT --> CART_DRAWER

  %% Store pages → Layout
  STORE_LAYOUT --> NAVBAR
  STORE_LAYOUT --> FOOTER

  %% Home page → Home components
  HOME --> HERO
  HOME --> FEATURED
  HOME --> NEW_ARR_COMP
  HOME --> SOCIAL
  HOME --> TREASURE_COMP
  HOME --> WHY_US

  %% Store page → Store components
  SHOP --> PRODUCT_GRID
  SHOP --> SHOP_FILTERS
  PRODUCT_GRID --> PRODUCT_CARD
  PRODUCT --> PRODUCT_GALLERY
  PRODUCT --> ADD_TO_CART_BTN

  %% Image fallback chain (new)
  PRODUCT_GALLERY --> PLACEHOLDER
  PRODUCT_CARD --> UTILS
  TREASURE_COMP --> UTILS
  ADD_TO_CART_BTN --> UTILS

  %% UI primitives used by store components
  PRODUCT_CARD --> BADGE
  PRODUCT_CARD --> BUTTON
  CART_DRAWER --> BUTTON
  CART_DRAWER --> INPUT
  SHOP_FILTERS --> BUTTON
  PRODUCT_GALLERY --> BUTTON
  PRODUCT_FORM --> INPUT
  PRODUCT_FORM --> BUTTON
  PRODUCT_FORM --> BADGE
  CATEGORY_FORM --> INPUT
  CATEGORY_FORM --> BUTTON

  %% Admin components → UI
  ORDER_STATUS --> BUTTON
  ORDER_STATUS --> BADGE

  %% Admin pages → Admin components
  ADMIN_PRODUCTS --> PRODUCT_FORM
  ADMIN_PROD_NEW --> PRODUCT_FORM
  ADMIN_PROD_EDIT --> PRODUCT_FORM
  ADMIN_ORDERS --> ORDER_STATUS
  ADMIN_ORDER_DETAIL --> ORDER_STATUS
  ADMIN_CATEGORIES --> CATEGORY_FORM
  ADMIN_CAT_NEW --> CATEGORY_FORM
  ADMIN_CAT_EDIT --> CATEGORY_FORM

  %% Zustand stores
  CART_DRAWER --> CART_STORE
  NAVBAR --> CART_STORE
  NAVBAR --> UI_STORE
  PRODUCT_CARD --> CART_STORE
  PRODUCT_CARD --> UI_STORE
  ADD_TO_CART_BTN --> CART_STORE

  %% Queries → Supabase clients
  Q_PRODUCTS --> SB_SERVER
  Q_CATEGORIES --> SB_SERVER
  Q_ORDERS --> SB_SERVER
  Q_BANNERS --> SB_SERVER
  Q_ANALYTICS --> SB_SERVER
  SB_CLIENT --> SUPABASE_JS[("@supabase/supabase-js")]
  SB_SERVER --> SUPABASE_SSR[("@supabase/ssr")]

  %% ProductForm syncs product_images (NEW)
  PRODUCT_FORM --> SB_CLIENT
  PRODUCT_FORM --> SUPABASE_STORAGE[("Supabase Storage<br/>products bucket")]

  %% Pages → Queries
  HOME --> Q_PRODUCTS
  HOME --> Q_BANNERS
  SHOP --> Q_PRODUCTS
  SHOP --> Q_CATEGORIES
  PRODUCT --> Q_PRODUCTS
  ADMIN_HOME --> Q_ORDERS
  ADMIN_HOME --> Q_ANALYTICS
  ADMIN_PRODUCTS --> Q_PRODUCTS
  ADMIN_ORDERS --> Q_ORDERS
  ADMIN_CATEGORIES --> Q_CATEGORIES
  ADMIN_ANALYTICS --> Q_ANALYTICS

  %% API routes → Supabase
  API_ORDERS --> SB_SERVER
  API_KHALTI_INIT --> SB_SERVER
  API_KHALTI_VERIFY --> SB_SERVER
  API_KHALTI_WEBHOOK --> SB_SERVER
  API_CART_SYNC --> SB_SERVER

  %% Shared lib usage
  UTILS --> CLSX_DEP[("clsx + tailwind-merge")]
  PRODUCT_FORM --> VAL_PRODUCT
  LOGIN --> VAL_AUTH
  REGISTER --> VAL_AUTH
  CART_DRAWER --> VAL_CHECKOUT
  ORDER_SUCCESS --> VAL_CHECKOUT

  %% Types shared across
  Q_PRODUCTS --> TYPES_PRODUCT
  Q_ORDERS --> TYPES_ORDER
  Q_CATEGORIES --> TYPES_PRODUCT
  CART_STORE --> TYPES_PRODUCT
```

---

## 3. Image Resolution Pipeline (New)

This pipeline was introduced to fix broken product images. It shows the priority order for resolving a product's display image:

```mermaid
flowchart TD
  QUERY["DB Query<br/>products + product_images JOIN"]
  CHECK1{"product.images<br/>array non-empty?"}
  USE_PRIMARY["Use is_primary=true image<br/>from product_images table"]
  CHECK2{"product.image_url<br/>set?"}
  USE_FALLBACK["Use product.image_url<br/>directly as fallback"]
  USE_PLACEHOLDER["Use /placeholder-car.jpg<br/>(local static asset)"]

  QUERY --> CHECK1
  CHECK1 -- Yes --> USE_PRIMARY
  CHECK1 -- No --> CHECK2
  CHECK2 -- Yes --> USE_FALLBACK
  CHECK2 -- No --> USE_PLACEHOLDER

  USE_PRIMARY --> DISPLAY["🖼️ Display Image"]
  USE_FALLBACK --> DISPLAY
  USE_PLACEHOLDER --> DISPLAY
```

**Key components involved:**
- `lib/utils.ts` → `getPrimaryImage(images, fallbackUrl?)` — resolves for cards & thumbnails
- `components/store/ProductGallery.tsx` → `imageUrlFallback` prop — resolves for detail page gallery
- `components/admin/ProductForm.tsx` → on save, syncs `products.image_url` into `product_images` table

**Admin upload flow:**
```mermaid
flowchart LR
  UPLOAD["Admin uploads image"] --> STORAGE["Supabase Storage<br/>(products bucket)"]
  STORAGE --> URL["Public URL returned"]
  URL --> PRODUCTS_TABLE["UPDATE products<br/>SET image_url = URL"]
  PRODUCTS_TABLE --> IMAGES_TABLE["DELETE old product_images rows<br/>INSERT new primary row"]
  IMAGES_TABLE --> STOREFRONT["✅ Storefront gallery<br/>shows correct image"]
```

---

## 4. Data Flow Diagram

```mermaid
flowchart LR
  USER["👤 User / Browser"]

  subgraph Client ["Client Side"]
    PAGE["Next.js Page/Component"]
    SWR_HOOK["SWR Hook"]
    ZUSTAND["Zustand Store<br/>(cartStore / uiStore)"]
    RHF["React Hook Form<br/>+ Zod Validation"]
  end

  subgraph Server ["Server Side (RSC / API Routes)"]
    RSC["React Server Component"]
    API_RT["API Route Handler"]
    SB_SRV["Supabase Server Client<br/>(@supabase/ssr)"]
    SB_CLI["Supabase Browser Client<br/>(@supabase/supabase-js)"]
  end

  subgraph External ["External Services"]
    SUPABASE[("Supabase<br/>Postgres + Auth + Storage")]
    KHALTI["Khalti<br/>Payment Gateway"]
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
```

---

## 5. Database Schema & RLS Policy Map

```mermaid
graph TD
  subgraph Tables ["📊 Supabase Tables"]
    T_PROFILES["profiles"]
    T_PRODUCTS["products<br/>(+image_url field)"]
    T_PRODUCT_IMAGES["product_images"]
    T_CATEGORIES["categories"]
    T_BANNERS["banners"]
    T_ORDERS["orders"]
    T_ORDER_ITEMS["order_items"]
    T_CART_ITEMS["cart_items"]
    T_SITE_SETTINGS["site_settings ✨NEW"]
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
  T_CATEGORIES --> PUBLIC_READ
  T_CATEGORIES --> ADMIN_ALL
  T_BANNERS --> PUBLIC_READ
  T_BANNERS --> ADMIN_ALL
  T_PROFILES --> USER_OWN
  T_ORDERS --> USER_OWN
  T_ORDERS --> ADMIN_ALL
  T_CART_ITEMS --> USER_OWN
```

> **Note:** `product_images` admin write policy was **added in this session** — previously missing, which caused silent failures when saving images from the admin panel.

---

## 6. Route Hierarchy

```mermaid
graph TD
  ROOT["/"]

  ROOT --> STORE_GROUP["(store) group"]
  ROOT --> AUTH_GROUP["(auth) group"]
  ROOT --> ACC_GROUP["(account) group"]
  ROOT --> ADMIN_GROUP["admin/"]
  ROOT --> API_GROUP["api/"]

  STORE_GROUP --> R_HOME["/ — Homepage"]
  STORE_GROUP --> R_SHOP["shop/"]
  STORE_GROUP --> R_PRODUCT["product/[slug]/"]
  STORE_GROUP --> R_CART["cart/"]
  STORE_GROUP --> R_CHECKOUT["checkout/ ✨NEW"]
  STORE_GROUP --> R_BRANDS["brands/"]
  STORE_GROUP --> R_NEW["new-arrivals/"]
  STORE_GROUP --> R_TREASURE["treasure-hunt/"]
  STORE_GROUP --> R_ORDER_OK["order/success/[id]/"]

  AUTH_GROUP --> R_LOGIN["login/"]
  AUTH_GROUP --> R_REGISTER["register/"]

  ACC_GROUP --> R_ACCOUNT["account/"]

  ADMIN_GROUP --> R_ADMIN["admin/ — Dashboard"]
  ADMIN_GROUP --> R_ADMIN_PROD["admin/products/"]
  ADMIN_GROUP --> R_ADMIN_PROD_NEW["admin/products/new/ ✨NEW"]
  ADMIN_GROUP --> R_ADMIN_PROD_EDIT["admin/products/[id]/edit/ ✨NEW"]
  ADMIN_GROUP --> R_ADMIN_ORDERS["admin/orders/"]
  ADMIN_GROUP --> R_ADMIN_ORDER_ID["admin/orders/[id]/ ✨NEW"]
  ADMIN_GROUP --> R_ADMIN_CAT["admin/categories/"]
  ADMIN_GROUP --> R_ADMIN_CAT_NEW["admin/categories/new/ ✨NEW"]
  ADMIN_GROUP --> R_ADMIN_CAT_EDIT["admin/categories/[id]/edit/ ✨NEW"]
  ADMIN_GROUP --> R_ADMIN_ANA["admin/analytics/"]
  ADMIN_GROUP --> R_ADMIN_SET["admin/settings/"]

  API_GROUP --> R_API_ORDERS["api/orders/"]
  API_GROUP --> R_API_KHALTI_I["api/payment/khalti/initiate/"]
  API_GROUP --> R_API_KHALTI_V["api/payment/khalti/verify/"]
  API_GROUP --> R_API_KHALTI_W["api/payment/khalti/webhook/ ✨NEW"]
  API_GROUP --> R_API_CART["api/cart/sync/ ✨NEW"]
  API_GROUP --> R_API_AUTH_CB["api/auth/callback/ ✨NEW"]
  API_GROUP --> R_API_AUTH_SO["api/auth/signout/ ✨NEW"]
```

---

## 7. Summary Table

| Layer | Modules |
|---|---|
| **Pages (Store)** | `/`, `/shop`, `/product/[slug]`, `/cart`, `/checkout` ✨, `/order/success/[id]`, `/brands`, `/new-arrivals`, `/treasure-hunt` |
| **Pages (Auth)** | `/login`, `/register` |
| **Pages (Account)** | `/account` |
| **Pages (Admin)** | `/admin`, `/admin/products`, `/admin/products/new` ✨, `/admin/products/[id]/edit` ✨, `/admin/orders`, `/admin/orders/[id]` ✨, `/admin/categories`, `/admin/categories/new` ✨, `/admin/categories/[id]/edit` ✨, `/admin/analytics`, `/admin/settings` |
| **API Routes** | `/api/orders`, `/api/payment/khalti/initiate`, `/api/payment/khalti/verify`, `/api/payment/khalti/webhook` ✨, `/api/cart/sync` ✨, `/api/auth/callback` ✨, `/api/auth/signout` ✨ |
| **Layout Components** | `Navbar`, `Footer`, `AnnouncementBar` |
| **Home Components** | `HeroSection`, `FeaturedDrops`, `NewArrivals`, `SocialStrip`, `TreasureHuntZone`, `WhyChooseUs` |
| **Store Components** | `CartDrawer`, `ProductCard`, `ProductGallery` 🔧, `ProductGrid`, `ShopFilters`, `AddToCartDetailButton` ✨ |
| **Admin Components** | `OrderStatusUpdater`, `ProductForm` 🔧, `CategoryForm` ✨ |
| **UI Primitives** | `Badge`, `Button`, `Input`, `Skeleton` |
| **State (Zustand)** | `cartStore`, `uiStore` |
| **Data Layer** | `lib/supabase/queries/` — products, categories, orders, banners, analytics ✨ |
| **Supabase Clients** | `client.ts` (browser), `server.ts` (SSR) |
| **Validations (Zod)** | `auth.ts`, `checkout.ts`, `product.ts` |
| **Types** | `lib/types/product.ts` 🔧 (+ `image_url`), `lib/types/order.ts` ✨, `lib/types/api.ts` ✨ |
| **Shared Utils** | `lib/utils.ts` 🔧 (`getPrimaryImage` + fallback), `lib/constants.ts` |
| **Static Assets** | `public/placeholder-car.jpg` ✨ |
| **External Services** | Supabase (Postgres + Auth + Storage), Khalti (Payment) |
| **Config** | `next.config.ts` 🔧 (`unoptimized: true`), `supabase/schema.sql` 🔧 (admin RLS for product_images) |

**Legend:** ✨ New since last graph &nbsp;|&nbsp; 🔧 Modified since last graph
