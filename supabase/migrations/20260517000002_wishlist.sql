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
