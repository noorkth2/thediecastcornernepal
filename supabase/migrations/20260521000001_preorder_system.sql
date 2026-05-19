-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: PREORDER SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════════

-- Preorder configuration per product (or variant)
create table if not exists public.preorder_configs (
  id                serial primary key,
  product_id        int not null references public.products(id) on delete cascade,
  variant_id        int references public.product_variants(id) on delete cascade,
  is_active         boolean not null default false,
  estimated_arrival date not null,
  deposit_amount    numeric(10,2),             -- null = full payment required
  max_qty           int,                       -- null = unlimited
  reserved_qty      int not null default 0,
  closes_at         timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  
  -- Ensure variant belongs to product
  unique (product_id, variant_id)
);

-- Indexes
create index if not exists idx_preorder_product on public.preorder_configs(product_id);
create index if not exists idx_preorder_active on public.preorder_configs(is_active) where is_active = true;

-- RLS Policies
alter table public.preorder_configs enable row level security;

create policy "Anyone can view active preorder configs"
  on public.preorder_configs for select using (is_active = true);

create policy "Admins can manage preorder configs"
  on public.preorder_configs for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Update trigger for updated_at
drop trigger if exists set_updated_at on public.preorder_configs;
create trigger set_updated_at
  before update on public.preorder_configs
  for each row
  execute function public.handle_updated_at();

-- Extend orders table
alter table public.orders add column if not exists is_preorder boolean default false;
alter table public.orders add column if not exists preorder_config_id int references public.preorder_configs(id);
alter table public.orders add column if not exists estimated_arrival date;
alter table public.orders add column if not exists deposit_paid numeric(10,2) default 0;

-- Function to safely reserve preorder slots
create or replace function public.reserve_preorder_slot(
  p_config_id int,
  p_qty int
) returns jsonb language plpgsql security definer as $$
declare
  v_config record;
begin
  select * into v_config from public.preorder_configs 
  where id = p_config_id and is_active = true 
  for update;

  if not found then
    return jsonb_build_object('success', false, 'reason', 'not_found_or_inactive');
  end if;

  if v_config.closes_at is not null and v_config.closes_at < now() then
    return jsonb_build_object('success', false, 'reason', 'closed');
  end if;

  if v_config.max_qty is not null and (v_config.reserved_qty + p_qty) > v_config.max_qty then
    return jsonb_build_object('success', false, 'reason', 'sold_out');
  end if;

  update public.preorder_configs 
  set reserved_qty = reserved_qty + p_qty
  where id = p_config_id;

  return jsonb_build_object('success', true);
end;
$$;
