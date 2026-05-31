-- Migration: Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id int NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_email) -- Don't allow duplicate waitlist entries
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_product_id ON public.waitlist(product_id);

-- RLS Policies
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Admins can view all waitlist entries
CREATE POLICY "Admins can view waitlist"
  ON public.waitlist FOR SELECT
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Anyone can join the waitlist
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- Comment for documentation
COMMENT ON TABLE public.waitlist IS 'Stores email addresses of customers waiting for out-of-stock products.';
