-- ═══════════════════════════════════════════════════════════════════════════════
-- THE DIECAST CORNER NEPAL — SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  phone        text,
  address      text,
  city         text,
  avatar_url   text,
  role         text not null default 'customer' check (role in ('customer', 'admin')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-create profile on user sign up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  is_admin boolean;
begin
  is_admin := new.email in ('kayastha.noor1100@gmail.com', 'thediecastcornernepal@gmail.com');
  
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    case when is_admin then 'admin' else 'customer' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── CATEGORIES ──────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id          serial primary key,
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id               serial primary key,
  title            text not null,
  slug             text not null unique,
  description      text,
  price            numeric(10,2) not null,
  compare_price    numeric(10,2),
  category_id      int references public.categories(id) on delete set null,
  brand            text,
  scale            text,
  series           text,
  stock_qty        int not null default 0,
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  is_new_arrival   boolean not null default false,
  is_treasure_hunt boolean not null default false,
  is_limited       boolean not null default false,
  is_premium       boolean not null default false,
  tags             text[] default '{}',
  sort_order       int not null default 0,
  image_url        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── PRODUCT IMAGES ──────────────────────────────────────────────────────────
create table if not exists public.product_images (
  id          serial primary key,
  product_id  int not null references public.products(id) on delete cascade,
  image_url   text not null,
  alt_text    text,
  is_primary  boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ─── BANNERS ────────────────────────────────────────────────────────────────
create table if not exists public.banners (
  id                  serial primary key,
  type                text not null check (type in ('announcement', 'hero', 'promo')),
  announcement_text   text,
  title               text,
  subtitle            text,
  cta_label           text,
  cta_url             text,
  image_url           text,
  is_active           boolean not null default true,
  display_start       timestamptz,
  display_end         timestamptz,
  sort_order          int not null default 0,
  created_at          timestamptz not null default now()
);

-- ─── ORDERS ──────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id               serial primary key,
  user_id          uuid references public.profiles(id) on delete set null,
  order_code       text not null unique,
  status           text not null default 'pending'
                     check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_method   text not null check (payment_method in ('khalti','esewa','cod')),
  payment_status   text not null default 'unpaid'
                     check (payment_status in ('unpaid','paid','refunded')),
  total_amount     numeric(10,2) not null,
  shipping_charge  numeric(10,2) not null default 150,
  shipping_address jsonb not null,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── ORDER ITEMS ─────────────────────────────────────────────────────────────
create table if not exists public.order_items (
  id              serial primary key,
  order_id        int not null references public.orders(id) on delete cascade,
  product_id      int references public.products(id) on delete set null,
  product_title   text not null,
  product_image   text,
  product_brand   text,
  quantity        int not null,
  unit_price      numeric(10,2) not null,
  created_at      timestamptz not null default now()
);

-- ─── CART ITEMS (server-side sync for logged in users) ───────────────────────
create table if not exists public.cart_items (
  id          serial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  product_id  int not null references public.products(id) on delete cascade,
  quantity    int not null default 1,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ─── STOCK DECREMENT RPC ─────────────────────────────────────────────────────
create or replace function public.decrement_stock(product_id int, qty int)
returns void language plpgsql security definer as $$
begin
  update public.products
  set stock_qty = greatest(0, stock_qty - qty)
  where id = product_id;
end;
$$;

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
create index if not exists idx_products_slug         on public.products(slug);
create index if not exists idx_products_is_active    on public.products(is_active);
create index if not exists idx_products_category_id  on public.products(category_id);
create index if not exists idx_products_brand        on public.products(brand);
create index if not exists idx_orders_user_id        on public.orders(user_id);
create index if not exists idx_orders_status         on public.orders(status);
create index if not exists idx_order_items_order_id  on public.order_items(order_id);

-- ─── RLS POLICIES ────────────────────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.products      enable row level security;
alter table public.categories    enable row level security;
alter table public.banners       enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.cart_items    enable row level security;
alter table public.product_images enable row level security;

-- Profiles: users can only view/update their own
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Products: anyone can view active products
create policy "Anyone can view active products"
  on public.products for select using (is_active = true);
create policy "Admins can do anything with products"
  on public.products for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Product images: public read
create policy "Anyone can view product images"
  on public.product_images for select using (true);

-- Categories: public read
create policy "Anyone can view categories"
  on public.categories for select using (true);

-- Banners: public read
create policy "Anyone can view active banners"
  on public.banners for select using (is_active = true);

-- Orders: users can view their own; admins can see all
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);
create policy "Anyone can create orders"
  on public.orders for insert with check (true);
create policy "Admins can manage all orders"
  on public.orders for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Order items: follow order access
create policy "Users can view own order items"
  on public.order_items for select
  using (exists (select 1 from public.orders where id = order_id and user_id = auth.uid()));
create policy "Anyone can create order items"
  on public.order_items for insert with check (true);

-- Cart items: only own
create policy "Users can manage own cart"
  on public.cart_items for all using (auth.uid() = user_id);

-- ─── SEED: Default categories ─────────────────────────────────────────────────
insert into public.categories (name, slug, sort_order) values
  ('MiniGT', 'minigt', 1),
  ('Tomica', 'tomica', 2),
  ('Matchbox', 'matchbox', 3),
  ('Greenlight', 'greenlight', 4),
  ('Premium 1:18 & 1:24', 'premium', 5),
  ('Treasure Hunts', 'treasure-hunts', 6),
  ('Limited Edition', 'limited-edition', 7)
on conflict (slug) do nothing;
-- Add missing admin policies for product_images, categories, and banners
create policy "Admins can manage product images"
  on public.product_images for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can manage categories"
  on public.categories for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can manage banners"
  on public.banners for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ─── WISHLIST ITEMS ────────────────────────────────────────────────────────────
create table if not exists public.wishlist_items (
  id          serial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  product_id  int not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ─── RLS POLICIES FOR WISHLIST ───────────────────────────────────────────────
alter table public.wishlist_items enable row level security;

create policy "Users can manage own wishlist"
  on public.wishlist_items for all using (auth.uid() = user_id);
