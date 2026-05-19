-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: ADVANCED SEARCH ENGINE (FTS & pg_trgm)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Enable pg_trgm extension for fuzzy matching (typo tolerance)
create extension if not exists pg_trgm;

-- 2. Add tsvector column for fast exact/prefix matching
alter table public.products 
add column if not exists fts tsvector;

-- 3. Function to update the fts column automatically
create or replace function public.products_fts_update() returns trigger as $$
begin
  new.fts :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.brand, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.series, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'D');
  return new;
end;
$$ language plpgsql;

-- 4. Trigger to keep fts updated
drop trigger if exists products_fts_update_trigger on public.products;
create trigger products_fts_update_trigger
  before insert or update of title, brand, series, description
  on public.products
  for each row execute function public.products_fts_update();

-- 5. Backfill existing data
update public.products 
set fts = setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(brand, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(series, '')), 'C') ||
          setweight(to_tsvector('english', coalesce(description, '')), 'D')
where fts is null;

-- 6. Create GIN index for full-text search
create index if not exists idx_products_fts on public.products using gin(fts);

-- 7. Create GIN trigram indexes for fuzzy matching (typos)
create index if not exists idx_products_title_trgm on public.products using gin (title gin_trgm_ops);
create index if not exists idx_products_brand_trgm on public.products using gin (brand gin_trgm_ops);

-- 8. RPC Function for hybrid search (FTS + Trigram fallback)
create or replace function public.search_products(search_query text, max_results int default 10)
returns setof public.products language plpgsql security definer as $$
begin
  -- First try exact/prefix match with FTS
  -- to_tsquery handles spaces. websearch_to_tsquery is even better for user input.
  return query
  select * from public.products
  where is_active = true
    and fts @@ websearch_to_tsquery('english', search_query)
  order by ts_rank(fts, websearch_to_tsquery('english', search_query)) desc
  limit max_results;

  -- If we got results, great. If not (typo), we could fallback to pg_trgm.
  -- But for simplicity and performance in a single RPC, we combine them:
  if not found then
    return query
    select * from public.products
    where is_active = true
      and (
        title % search_query or 
        brand % search_query
      )
    order by similarity(title, search_query) desc
    limit max_results;
  end if;
end;
$$;
