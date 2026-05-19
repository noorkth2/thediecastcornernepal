-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: ABANDONED CART RECOVERY SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists public.cart_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete set null,
  email         text,                    -- captured at checkout step 1
  session_token text unique,
  cart_snapshot jsonb not null,          -- {items: [{id,title,price,qty}]}
  last_active   timestamptz default now(),
  recovered_at  timestamptz,
  recovery_discount_code text,
  created_at    timestamptz default now()
);

create index if not exists idx_cart_sessions_token on public.cart_sessions(session_token);
create index if not exists idx_cart_sessions_email on public.cart_sessions(email);
create index if not exists idx_cart_sessions_last_active on public.cart_sessions(last_active);

-- Enable RLS
alter table public.cart_sessions enable row level security;

-- Admin can view all
create policy "Admins can view all cart sessions"
  on public.cart_sessions for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Service role can manage all
create policy "Service role can manage cart sessions"
  on public.cart_sessions for all
  using (true)
  with check (true);
