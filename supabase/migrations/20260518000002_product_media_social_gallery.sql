-- Migration: product_media table
-- Purpose: Stores rich media (images, videos, embeds) per product.
-- Kept separate from product_images to avoid breaking the existing image pipeline.

CREATE TABLE IF NOT EXISTS product_media (
  id            SERIAL PRIMARY KEY,
  product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  -- media_type: 'image' | 'video' | 'youtube' | 'instagram' | 'tiktok'
  media_type    TEXT NOT NULL CHECK (media_type IN ('image','video','youtube','instagram','tiktok')),
  media_url     TEXT NOT NULL,            -- Direct URL, YouTube link, or Instagram reel link
  thumbnail_url TEXT,                     -- For videos: preview poster image URL
  -- aspect_ratio: '16:9' | '9:16' | '1:1' | '21:9'
  aspect_ratio  TEXT NOT NULL DEFAULT '16:9',
  caption       TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_primary    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;

-- Public: read all product media (storefront needs it)
CREATE POLICY "product_media_public_read"
  ON product_media FOR SELECT
  USING (true);

-- Admin: full access
CREATE POLICY "product_media_admin_all"
  ON product_media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_product_media_product ON product_media (product_id, sort_order ASC);

-- Migration: social_gallery table
-- Purpose: Community showcase / collector media gallery on the homepage.

CREATE TABLE IF NOT EXISTS social_gallery (
  id                SERIAL PRIMARY KEY,
  title             TEXT,
  description       TEXT,
  -- platform: 'youtube' | 'instagram' | 'tiktok' | 'video' | 'image'
  platform          TEXT NOT NULL CHECK (platform IN ('youtube','instagram','tiktok','video','image')),
  media_url         TEXT NOT NULL,
  thumbnail_url     TEXT,
  aspect_ratio      TEXT NOT NULL DEFAULT '16:9',
  linked_product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE social_gallery ENABLE ROW LEVEL SECURITY;

-- Public: read all gallery items
CREATE POLICY "social_gallery_public_read"
  ON social_gallery FOR SELECT
  USING (true);

-- Admin: full access
CREATE POLICY "social_gallery_admin_all"
  ON social_gallery FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_social_gallery_sort ON social_gallery (sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_gallery_featured ON social_gallery (is_featured) WHERE is_featured = true;
