-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: SQL-BASED RECOMMENDATION ENGINE
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Materialized View for "Also Bought Together" (item-item collaborative filtering)
create materialized view if not exists public.product_affinity as
select 
  oi1.product_id as product_a,
  oi2.product_id as product_b,
  count(*) as co_purchases
from public.order_items oi1
join public.order_items oi2 on oi1.order_id = oi2.order_id and oi1.product_id != oi2.product_id
group by oi1.product_id, oi2.product_id;

-- Unique index to allow concurrent refreshes
create unique index if not exists idx_product_affinity_ab on public.product_affinity(product_a, product_b);

-- 2. View for "Trending Products" (time-weighted sales velocity using exponential decay)
create or replace view public.trending_products as
select 
  oi.product_id, 
  sum(oi.quantity * exp(-0.05 * extract(epoch from now() - o.created_at) / 86400)) as trend_score
from public.order_items oi 
join public.orders o on o.id = oi.order_id
where o.created_at > now() - interval '30 days'
  and o.status in ('confirmed', 'processing', 'shipped', 'delivered')
group by oi.product_id
order by trend_score desc;

-- 3. Function to refresh affinity view concurrently
create or replace function public.refresh_product_affinity()
returns void language plpgsql security definer as $$
begin
  refresh materialized view concurrently public.product_affinity;
end;
$$;

-- 4. RPC: Get Also Bought Recommendations
create or replace function public.get_also_bought_recommendations(target_product_id int, max_results int default 4)
returns setof public.products language plpgsql security definer as $$
begin
  return query
  select p.*
  from public.product_affinity pa
  join public.products p on p.id = pa.product_b
  where pa.product_a = target_product_id
    and p.is_active = true
    and p.stock_qty > 0
  order by pa.co_purchases desc
  limit max_results;
end;
$$;

-- 5. RPC: Get Trending Products
create or replace function public.get_trending_products(max_results int default 8)
returns setof public.products language plpgsql security definer as $$
begin
  return query
  select p.*
  from public.trending_products tp
  join public.products p on p.id = tp.product_id
  where p.is_active = true
    and p.stock_qty > 0
  order by tp.trend_score desc
  limit max_results;
end;
$$;

-- 6. RPC: Complete Your Collection (Brand/Scale affinity)
create or replace function public.get_collection_recommendations(target_user_id uuid, max_results int default 4)
returns setof public.products language plpgsql security definer as $$
declare
  fav_brand text;
  fav_scale text;
begin
  -- Get user's most collected brand
  select brand into fav_brand
  from public.collector_items
  where user_id = target_user_id and brand is not null
  group by brand
  order by count(*) desc
  limit 1;

  -- Get user's most collected scale
  select scale into fav_scale
  from public.collector_items
  where user_id = target_user_id and scale is not null
  group by scale
  order by count(*) desc
  limit 1;

  -- If user has no items yet, fallback to trending products
  if fav_brand is null then
    return query
    select p.* from public.products p
    where p.is_active = true
      and p.stock_qty > 0
    order by p.created_at desc
    limit max_results;
  else
    return query
    select p.*
    from public.products p
    where p.is_active = true
      and p.stock_qty > 0
      and (p.brand = fav_brand or p.scale = fav_scale)
      -- Exclude items user already owns
      and not exists (
        select 1 from public.collector_items ci
        where ci.user_id = target_user_id and ci.product_id = p.id
      )
      -- Exclude items already in user's wishlist
      and not exists (
        select 1 from public.wishlist w
        where w.user_id = target_user_id and w.product_id = p.id
      )
    order by p.is_featured desc, p.created_at desc
    limit max_results;
  end if;
end;
$$;
