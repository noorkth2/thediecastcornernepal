-- Migration: Add status and expected arrival to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'IN_STOCK' 
CHECK (status IN ('IN_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER'));

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS expected_arrival_date DATE;

-- Comment for documentation
COMMENT ON COLUMN public.products.status IS 'Product availability status: IN_STOCK, OUT_OF_STOCK, or PRE_ORDER';
COMMENT ON COLUMN public.products.expected_arrival_date IS 'Expected arrival date for PRE_ORDER items';
