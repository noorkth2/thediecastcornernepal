-- ==============================================================================
-- FULL CLEANUP + RE-SEED SCRIPT
-- Run this in your Supabase SQL Editor.
-- This will REMOVE all old Hot Wheels data and replace with a full catalogue.
-- ==============================================================================

-- ── Step 1: Clean up old data ─────────────────────────────────────────────────
DELETE FROM public.order_items WHERE product_brand = 'Hot Wheels';
DELETE FROM public.product_images; -- clear images to avoid duplicates on re-seed
DELETE FROM public.products; -- clear all products to ensure clean seed
DELETE FROM public.categories WHERE slug = 'hot-wheels';

-- ── Step 2: Ensure all categories exist ──────────────────────────────────────
INSERT INTO public.categories (name, slug, sort_order, is_active) VALUES
  ('MiniGT',               'minigt',           1,  true),
  ('Tomica',               'tomica',           2,  true),
  ('Matchbox',             'matchbox',         3,  true),
  ('Greenlight',           'greenlight',       4,  true),
  ('Majorette',            'majorette',        5,  true),
  ('INNO64',               'inno64',           6,  true),
  ('Tarmac Works',         'tarmac-works',     7,  true),
  ('Auto World',           'auto-world',       8,  true),
  ('M2 Machines',          'm2-machines',      9,  true),
  ('Era Car',              'era-car',          10, true),
  ('Premium 1:18 & 1:24', 'premium',          11, true),
  ('Treasure Hunts',       'treasure-hunts',   12, true),
  ('Limited Edition',      'limited-edition',  13, true)
ON CONFLICT (slug) DO NOTHING;

-- ── Step 3: Insert full product catalogue ─────────────────────────────────────
INSERT INTO public.products (
  title, slug, description, price, compare_price, category_id, brand, scale, series,
  stock_qty, is_active, is_featured, is_new_arrival, is_treasure_hunt, is_limited, is_premium, image_url
) VALUES

-- MiniGT
('Nissan Skyline GT-R (R34) Bayside Blue',
 'minigt-r34-bayside-blue',
 'MiniGT 1:64 precision replica of the legendary Skyline GT-R R34 in iconic Bayside Blue.',
 2500.00, 3000.00,
 (SELECT id FROM categories WHERE slug='minigt'),
 'MiniGT', '1:64', 'Kaido House', 12, true, true, true, false, false, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

('Lamborghini Urus PPearl Capsule',
 'minigt-urus-pearl',
 'MiniGT Lamborghini Urus in stunning pearl white with opening doors.',
 2800.00, NULL,
 (SELECT id FROM categories WHERE slug='minigt'),
 'MiniGT', '1:64', 'MiniGT Series', 8, true, true, false, false, false, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

('Porsche 911 GT3 RS Weissach Package',
 'minigt-911-gt3-rs-weissach',
 'Ultra-detailed MiniGT Porsche 911 GT3 RS with Weissach aero package in orange.',
 3200.00, NULL,
 (SELECT id FROM categories WHERE slug='minigt'),
 'MiniGT', '1:64', 'MiniGT Series', 6, true, true, true, false, false, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

('Ferrari SF90 Stradale Red',
 'minigt-sf90-red',
 'MiniGT Ferrari SF90 Stradale in Rosso Corsa with detailed interior.',
 2900.00, 3200.00,
 (SELECT id FROM categories WHERE slug='minigt'),
 'MiniGT', '1:64', 'MiniGT Series', 5, true, false, true, false, false, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

-- Tomica
('Toyota Supra MK4 White',
 'tomica-supra-mk4-white',
 'Tomica Premium Toyota Supra MK4 in classic white with authentic tampo prints.',
 1800.00, 2000.00,
 (SELECT id FROM categories WHERE slug='tomica'),
 'Tomica', '1:64', 'Tomica Premium', 10, true, false, false, false, false, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

('Nissan GT-R R35 Midnight Purple',
 'tomica-gtr-r35-purple',
 'Tomica Limited Vintage Neo Nissan GT-R in deep midnight purple.',
 2200.00, NULL,
 (SELECT id FROM categories WHERE slug='tomica'),
 'Tomica', '1:64', 'Tomica Premium', 7, true, true, true, false, false, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

('Honda NSX Type R White',
 'tomica-nsx-type-r',
 'Tomica Premium Honda NSX Type R in Championship White.',
 2000.00, NULL,
 (SELECT id FROM categories WHERE slug='tomica'),
 'Tomica', '1:64', 'Tomica Premium', 9, true, false, true, false, false, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

-- Matchbox
('Toyota Land Cruiser 76 White',
 'matchbox-lc76-white',
 'Matchbox Moving Parts Toyota Land Cruiser 76. Rare chase variant in white.',
 3500.00, NULL,
 (SELECT id FROM categories WHERE slug='matchbox'),
 'Matchbox', '1:64', 'Moving Parts', 3, true, true, false, true, true, false,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

('Datsun 510 Wagon Blue',
 'matchbox-datsun-510-blue',
 'Classic Matchbox JDM Datsun 510 Wagon in Cobalt Blue.',
 750.00, NULL,
 (SELECT id FROM categories WHERE slug='matchbox'),
 'Matchbox', '1:64', 'JDM Legends', 25, true, false, false, false, false, false,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

('Jeep Gladiator Mojave',
 'matchbox-jeep-gladiator',
 'Matchbox 2021 Jeep Gladiator Mojave in sand dune tan.',
 650.00, NULL,
 (SELECT id FROM categories WHERE slug='matchbox'),
 'Matchbox', '1:64', 'Matchbox Series', 30, true, false, true, false, false, false,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

-- Greenlight
('1967 Pontiac GTO Fathom Green',
 'greenlight-pontiac-gto-67',
 'Greenlight 1:64 1967 Pontiac GTO in Fathom Green. Die-cast body with opening hood.',
 1800.00, NULL,
 (SELECT id FROM categories WHERE slug='greenlight'),
 'Greenlight', '1:64', 'Muscle Car Garage', 18, true, true, true, false, false, false,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

('1969 Dodge Charger R/T Fast & Furious',
 'greenlight-charger-ff',
 'Greenlight Fast & Furious 1969 Dodge Charger R/T in matte black.',
 2200.00, 2500.00,
 (SELECT id FROM categories WHERE slug='greenlight'),
 'Greenlight', '1:64', 'Fast & Furious', 14, true, true, false, false, false, false,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

('Ford Mustang Mach-E GT Blue',
 'greenlight-mustang-mache',
 'Greenlight Ford Mustang Mach-E GT in Grabber Blue.',
 1600.00, NULL,
 (SELECT id FROM categories WHERE slug='greenlight'),
 'Greenlight', '1:64', 'Electric Vehicle Series', 20, true, false, true, false, false, false,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

-- Majorette
('Lamborghini Sian Gold',
 'majorette-sian-gold',
 'Majorette Premium Lamborghini Sian in striking metallic gold.',
 950.00, NULL,
 (SELECT id FROM categories WHERE slug='majorette'),
 'Majorette', '1:64', 'Premium Cars', 22, true, false, true, false, false, false,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

('Toyota GR86 Red',
 'majorette-gr86-red',
 'Majorette Toyota GR86 in rally red with rubber tires.',
 850.00, NULL,
 (SELECT id FROM categories WHERE slug='majorette'),
 'Majorette', '1:64', 'Premium Cars', 28, true, false, false, false, false, false,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

-- INNO64
('Honda Civic EK9 Type R Championship White',
 'inno64-civic-ek9',
 'INNO64 ultra-detailed Honda Civic EK9 Type R with PE parts in Championship White.',
 3800.00, NULL,
 (SELECT id FROM categories WHERE slug='inno64'),
 'INNO64', '1:64', 'INNO64 Series', 6, true, true, false, false, true, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

('Mitsubishi Lancer Evolution VI Tommi Makinen',
 'inno64-evo6-tommi',
 'INNO64 Mitsubishi Lancer Evolution VI Tommi Makinen Edition in red/white rally spec.',
 4200.00, NULL,
 (SELECT id FROM categories WHERE slug='inno64'),
 'INNO64', '1:64', 'Rally Icons', 4, true, true, true, false, true, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

-- Tarmac Works
('Porsche 911 RSR Le Mans',
 'tarmac-911-rsr-lemans',
 'Tarmac Works 1:64 Porsche 911 RSR Le Mans 24H race livery.',
 4500.00, NULL,
 (SELECT id FROM categories WHERE slug='tarmac-works'),
 'Tarmac Works', '1:64', 'Global64', 5, true, true, false, false, true, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

('Honda NSX GT3 Motul',
 'tarmac-nsx-gt3-motul',
 'Tarmac Works Honda NSX GT3 in Motul racing livery.',
 4800.00, NULL,
 (SELECT id FROM categories WHERE slug='tarmac-works'),
 'Tarmac Works', '1:64', 'Global64', 4, true, false, true, false, true, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

-- Auto World
('1970 Chevy Chevelle SS 396 Red',
 'autoworld-chevelle-ss396',
 'Auto World 1970 Chevy Chevelle SS 396 in Rally Red with opening hood.',
 2400.00, NULL,
 (SELECT id FROM categories WHERE slug='auto-world'),
 'Auto World', '1:64', 'Premium Series', 11, true, false, true, false, false, false,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

-- M2 Machines
('1968 Ford Mustang GT 390 Highland Green',
 'm2-mustang-gt390',
 'M2 Machines 1:64 1968 Mustang GT 390 in Highland Green — as seen in Bullitt.',
 3200.00, NULL,
 (SELECT id FROM categories WHERE slug='m2-machines'),
 'M2 Machines', '1:64', 'Auto-Thentics', 8, true, true, false, false, false, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

-- Era Car
('Honda City Turbo II Rosso',
 'eracar-city-turbo2',
 'Era Car Honda City Turbo II in Milano Red. JDM classic in 1:64.',
 2800.00, NULL,
 (SELECT id FROM categories WHERE slug='era-car'),
 'Era Car', '1:64', 'JDM Series', 9, true, true, true, false, false, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

-- Premium
('Ferrari F40 Red 1:18',
 'premium-ferrari-f40-118',
 'Premium 1:18 Ferrari F40 in Rosso Corsa. Highly detailed die-cast model.',
 18000.00, 20000.00,
 (SELECT id FROM categories WHERE slug='premium'),
 'Bburago', '1:18', 'Race & Play', 3, true, true, false, false, false, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

('Lamborghini Countach 25th Anniversary 1:18',
 'premium-countach-25th-118',
 'Premium 1:18 Lamborghini Countach 25th Anniversary Edition in white.',
 16500.00, NULL,
 (SELECT id FROM categories WHERE slug='premium'),
 'Bburago', '1:18', 'Race & Play', 2, true, false, false, false, true, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

-- Limited Edition
('Nissan Skyline GT-R R32 Group A Racing',
 'limited-r32-group-a',
 'Limited edition INNO64 Nissan Skyline GT-R R32 Group A Bathurst livery.',
 6500.00, NULL,
 (SELECT id FROM categories WHERE slug='limited-edition'),
 'INNO64', '1:64', 'Racing Series', 2, true, true, false, true, true, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'),

('Mazda RX-7 FD3S RE Amemiya',
 'limited-rx7-fd-reamemiya',
 'Tarmac Works limited edition Mazda RX-7 FD3S with RE Amemiya wide body kit.',
 5800.00, NULL,
 (SELECT id FROM categories WHERE slug='limited-edition'),
 'Tarmac Works', '1:64', 'Global64', 3, true, true, true, false, true, true,
 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg')

ON CONFLICT (slug) DO NOTHING;

-- ── Step 4: Verify ────────────────────────────────────────────────────────────
SELECT brand, COUNT(*) as total FROM public.products GROUP BY brand ORDER BY brand;
SELECT name, slug FROM public.categories ORDER BY sort_order;

-- ── Step 5: Generate product_images from the main product image_url ──────────
INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, image_url, title, true, 1 FROM public.products
ON CONFLICT DO NOTHING;
