-- Add is_active column to categories table
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS is_active boolean not null default true;

-- Update the existing view to reflect category changes if necessary (not strictly needed for just a column addition, but good practice)
-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
