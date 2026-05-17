-- Create the site_settings table to persist store configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR ALL
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('store_name', 'The Diecast Corner Nepal'),
  ('store_email', ''),
  ('store_phone', ''),
  ('store_address', 'Kathmandu, Nepal'),
  ('free_shipping_threshold', '2000'),
  ('standard_shipping_charge', '150'),
  ('delivery_estimate', '2–5 business days'),
  ('instagram_url', 'https://instagram.com/thediecastcornernepal'),
  ('facebook_url', 'https://facebook.com/thediecastcornernepal'),
  ('tiktok_url', 'https://tiktok.com/@thediecastcornernepal'),
  ('order_notification_email', '')
ON CONFLICT (key) DO NOTHING;
