-- Create a view to get the count of active products per category
-- This solves the N+1 query issue on the admin categories page
CREATE OR REPLACE VIEW category_product_counts AS
SELECT
  category_id,
  count(*) as product_count
FROM products
WHERE is_active = true AND category_id IS NOT NULL
GROUP BY category_id;

-- Grant permissions to authenticated users to read from the view
GRANT SELECT ON category_product_counts TO authenticated;
GRANT SELECT ON category_product_counts TO service_role;
