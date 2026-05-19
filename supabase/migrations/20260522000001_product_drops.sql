-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: LIVE PRODUCT DROPS
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Create product_drops table
create table if not exists public.product_drops (
  id                    serial primary key,
  product_id            int not null references public.products(id) on delete cascade,
  drop_name             text not null,
  drops_at              timestamptz not null,
  max_per_user          int not null default 1,
  waiting_room_opens_at timestamptz not null,
  status                text not null default 'scheduled'
    check (status in ('scheduled','waiting','live','sold_out','ended')),
  anti_bot_delay        int not null default 3,  -- seconds to delay CTA button activation
  created_at            timestamptz not null default now()
);

-- Enable RLS
alter table public.product_drops enable row level security;

-- Policies for product_drops
create policy "Anyone can read product drops"
  on public.product_drops for select
  using (true);

create policy "Admins can manage product drops"
  on public.product_drops for all
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
        and profiles.role = 'admin'
    )
  );

-- 2. Add table to Supabase Realtime publication
do $$
begin
  -- Try to add table to publication. If it fails (usually because it's already there), ignore
  alter publication supabase_realtime add table public.product_drops;
exception when others then
  null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.products;
exception when others then
  null;
end;
$$;
