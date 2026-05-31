-- Migration: Add shipping address to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT NULL;

-- Comment for documentation
COMMENT ON COLUMN public.profiles.shipping_address IS 'Stores the default shipping address (name, phone, address, city, landmark)';
