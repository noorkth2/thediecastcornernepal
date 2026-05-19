-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: COLLECTOR PROFILES & GARAGE
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Extend profiles table with collector attributes
alter table public.profiles
  add column if not exists username    text unique,
  add column if not exists bio         text,
  add column if not exists is_public   boolean not null default false,
  add column if not exists avatar_url   text;

-- Create index on username for quick profile lookups
create index if not exists idx_profiles_username on public.profiles(username);

-- 2. Create collector_garage table for custom entries
create table if not exists public.collector_garage (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  product_id   int references public.products(id) on delete set null,
  custom_name  text,             -- For custom builds or external models
  custom_brand text,
  custom_image text,
  notes        text,
  acquired_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index if not exists idx_garage_user on public.collector_garage(user_id);

-- Enable RLS
alter table public.collector_garage enable row level security;

-- Policies for collector_garage
create policy "Users can manage their own garage"
  on public.collector_garage for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Anyone can view public garage items"
  on public.collector_garage for select
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = collector_garage.user_id 
        and profiles.is_public = true
    )
  );

-- Policies for profiles update
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. Database view to present unified collector items (Bought + Custom)
create or replace view public.collector_items as
  -- Part A: Official purchases
  select 
    o.user_id,
    oi.product_id,
    p.title as name,
    p.brand,
    coalesce(pi.image_url, p.image_url) as image_url,
    o.created_at as acquired_at,
    'purchase' as source,
    null::text as notes,
    null::uuid as garage_id,
    p.is_treasure_hunt,
    p.scale
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  join public.products p on p.id = oi.product_id
  left join public.product_images pi on pi.product_id = p.id and pi.is_primary = true
  where o.status in ('confirmed', 'processing', 'shipped', 'delivered')
     or o.payment_status = 'paid'
     
  union all
  
  -- Part B: Custom/Manual additions
  select 
    cg.user_id,
    cg.product_id,
    coalesce(p.title, cg.custom_name) as name,
    coalesce(p.brand, cg.custom_brand) as brand,
    coalesce(pi.image_url, p.image_url, cg.custom_image) as image_url,
    cg.acquired_at,
    'manual' as source,
    cg.notes,
    cg.id as garage_id,
    coalesce(p.is_treasure_hunt, false) as is_treasure_hunt,
    p.scale
  from public.collector_garage cg
  left join public.products p on p.id = cg.product_id
  left join public.product_images pi on pi.product_id = p.id and pi.is_primary = true;
