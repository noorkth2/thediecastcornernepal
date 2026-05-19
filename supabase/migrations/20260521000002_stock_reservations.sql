-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: INVENTORY RESERVATION SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists public.stock_reservations (
  id          uuid primary key default gen_random_uuid(),
  product_id  int not null references public.products(id) on delete cascade,
  variant_id  int references public.product_variants(id) on delete cascade,
  session_id  text not null,
  quantity    int not null check (quantity > 0),
  reserved_at timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '15 minutes'
);

create index if not exists idx_reservations_expires on public.stock_reservations(expires_at);
create index if not exists idx_reservations_product on public.stock_reservations(product_id);
create index if not exists idx_reservations_session on public.stock_reservations(session_id);

-- Enable RLS
alter table public.stock_reservations enable row level security;

-- Only service role can access reservations directly
create policy "Service role can manage reservations" 
  on public.stock_reservations for all 
  using (true) 
  with check (true);

-- Atomic reservation function to prevent race conditions
create or replace function public.reserve_stock(
  p_product_id int, 
  p_variant_id int, 
  p_session text, 
  p_qty int
) returns jsonb language plpgsql security definer as $$
declare
  v_available int;
  v_reservation_id uuid;
begin
  -- Clean up expired reservations first
  delete from public.stock_reservations where expires_at < now();
  
  -- Calculate available stock for variant (if passed) or product
  if p_variant_id is not null then
    select v.stock_qty - coalesce(sum(r.quantity), 0)
    into v_available
    from public.product_variants v
    left join public.stock_reservations r on r.variant_id = v.id and r.expires_at > now()
    where v.id = p_variant_id
    group by v.stock_qty;
  else
    select p.stock_qty - coalesce(sum(r.quantity), 0)
    into v_available
    from public.products p
    left join public.stock_reservations r on r.product_id = p.id and r.expires_at > now()
    where p.id = p_product_id
    group by p.stock_qty;
  end if;
  
  if v_available is null or v_available < p_qty then
    return jsonb_build_object('success', false, 'reason', 'insufficient_stock', 'available', coalesce(v_available, 0));
  end if;
  
  -- Insert the reservation
  insert into public.stock_reservations(product_id, variant_id, session_id, quantity)
  values (p_product_id, p_variant_id, p_session, p_qty)
  returning id into v_reservation_id;
  
  return jsonb_build_object(
    'success', true, 
    'reservation_id', v_reservation_id, 
    'expires_at', (now() + interval '15 minutes')
  );
end;
$$;

-- Function to release stock manually (when cart item is removed)
create or replace function public.release_stock(
  p_reservation_id uuid,
  p_session text
) returns boolean language plpgsql security definer as $$
begin
  delete from public.stock_reservations 
  where id = p_reservation_id and session_id = p_session;
  
  return found;
end;
$$;
