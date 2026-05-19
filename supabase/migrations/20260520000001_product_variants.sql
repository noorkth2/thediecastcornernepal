-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: PRODUCT VARIANTS SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists public.product_variants (
  id             serial primary key,
  product_id     int not null references public.products(id) on delete cascade,
  sku            text not null unique,
  label          text not null, -- e.g. "Red / Chase / 1:64"
  scale          text,          -- override product scale
  color          text,
  condition      text check (condition in ('mint','near-mint','loose','damaged')),
  rarity         text check (rarity in ('standard','chase','super-chase','premium','limited')),
  packaging      text check (packaging in ('sealed','opened','card-only')),
  price_override numeric(10,2), -- null means use product.price
  stock_qty      int not null default 0,
  sort_order     int not null default 0,
  is_active      boolean not null default true,
  image_url      text,          -- variant-specific hero image
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Indexes
create index if not exists idx_variants_product_id on public.product_variants(product_id);
create index if not exists idx_variants_sku on public.product_variants(sku);

-- RLS Policies
alter table public.product_variants enable row level security;

create policy "Anyone can view active variants"
  on public.product_variants for select using (is_active = true);

create policy "Admins can manage variants"
  on public.product_variants for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Update trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.product_variants;
create trigger set_updated_at
  before update on public.product_variants
  for each row
  execute function public.handle_updated_at();

-- Add has_variants flag to products to optimize storefront rendering
alter table public.products add column if not exists has_variants boolean not null default false;
