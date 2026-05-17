-- ─── BRANDS TABLE ─────────────────────────────────────────────────────────────
create table if not exists public.brands (
  id          bigint generated always as identity primary key,
  name        text not null,
  slug        text not null,
  description text,
  logo_url    text,
  website_url text,
  is_active   boolean not null default true,
  sort_order  int     not null default 0,
  created_at  timestamptz default now(),
  constraint brands_name_unique unique (name),
  constraint brands_slug_unique unique (slug)
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
create index if not exists idx_brands_slug      on public.brands(slug);
create index if not exists idx_brands_is_active on public.brands(is_active);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table public.brands enable row level security;

create policy "Anyone can view active brands"
  on public.brands for select using (is_active = true);

create policy "Admins can manage brands"
  on public.brands for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ─── SEED — 20 real brands ────────────────────────────────────────────────────
insert into public.brands (name, slug, description, sort_order) values
  ('AR Box',        'ar-box',        'Artist-run brand releasing limited-edition themed diecast collections.', 1),
  ('BMC',           'bmc',           'Boutique manufacturer specialising in rare and limited collector models.', 2),
  ('DCM',           'dcm',           'Diecast Masters — premium large-scale construction and work vehicle models.', 3),
  ('Fine Works',    'fine-works',    'High-fidelity artisan diecast models built for display collectors.', 4),
  ('Fine Works 64', 'fine-works-64', 'Fine Works precision engineering in the popular 1:64 scale format.', 5),
  ('Greenlight',    'greenlight',    'US-licensed diecast — Hollywood, muscle cars & pop culture icons.', 6),
  ('HKM',           'hkm',           'Hong Kong Miniatures — affordable yet finely detailed 1:64 collectibles.', 7),
  ('INNO64',        'inno64',        'Ultra-detailed JDM and Asian market exclusives for serious collectors.', 8),
  ('Maasdi',        'maasdi',        'Unique diecast models with a focus on South and Southeast Asian markets.', 9),
  ('MiniGT',        'minigt',        '1:64 precision replicas of supercars, JDMs and exotics with jaw-dropping detail.', 10),
  ('Mini Station',  'mini-station',  'Niche brand producing limited-run Asian and JDM collector pieces.', 11),
  ('MJ Model',      'mj-model',      'Meticulously crafted replicas with a focus on Asian vehicle culture.', 12),
  ('Mortal',        'mortal',        'Edgy, street-inspired diecast with bold paint jobs and custom details.', 13),
  ('PopRace',       'poprace',       'Hong Kong brand crafting ultra-detailed 1:64 Japanese street and race cars.', 14),
  ('Street Warrior','street-warrior','Bold, detailed 1:64 street car replicas straight from the garage.', 15),
  ('Tarmac Works',  'tarmac-works',  'Racing and motorsport heritage captured in stunning 1:64 and 1:43 scale.', 16),
  ('TimeMicro',     'timemicro',     'Highly accurate Chinese and Asian vehicle replicas in 1:64 scale.', 17),
  ('Tomica',        'tomica',        'Japan''s iconic diecast brand — clean, accurate and endlessly collectible.', 18),
  ('Trends Hobby',  'trends-hobby',  'Asia-based brand covering popular car culture and lifestyle vehicles.', 19),
  ('Xcartoys',      'xcartoys',      'Chinese brand delivering sharp detail and exciting liveries in 1:64.', 20)
on conflict (name) do nothing;
