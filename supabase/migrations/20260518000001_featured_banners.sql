-- Migration: featured_banners table
-- Purpose: Powers the cinematic banner carousel on the homepage.
-- This is SEPARATE from the existing 'banners' table which handles announcements.

CREATE TABLE IF NOT EXISTS featured_banners (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  subtitle     TEXT,
  description  TEXT,
  badge        TEXT,                      -- Short label e.g. "NEW DROP", "LIMITED"
  button_text  TEXT DEFAULT 'Shop Now',
  button_link  TEXT DEFAULT '/shop',
  image_url    TEXT,                      -- Banner background image
  is_active    BOOLEAN NOT NULL DEFAULT true,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE featured_banners ENABLE ROW LEVEL SECURITY;

-- Public: read active banners
CREATE POLICY "featured_banners_public_read"
  ON featured_banners FOR SELECT
  USING (is_active = true);

-- Admin: full access
CREATE POLICY "featured_banners_admin_all"
  ON featured_banners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Sort index
CREATE INDEX IF NOT EXISTS idx_featured_banners_sort ON featured_banners (sort_order ASC, created_at DESC);
