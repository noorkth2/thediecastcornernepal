-- Insert default settings for payment gateways
INSERT INTO public.site_settings (key, value) VALUES
  ('payment_cod_enabled', 'true'),
  ('payment_khalti_enabled', 'false'),
  ('payment_esewa_enabled', 'false')
ON CONFLICT (key) DO NOTHING;
