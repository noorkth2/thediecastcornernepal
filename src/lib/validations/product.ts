import { z } from 'zod'

export const productSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, 'Lowercase letters, numbers, hyphens only')
    .optional()
    .or(z.literal('')),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  compare_price: z.coerce.number().min(0).optional().nullable(),
  category_id: z.coerce.number().optional().nullable(),
  brand: z.string().optional().nullable(),
  scale: z.string().optional().nullable(),
  series: z.string().optional().nullable(),
  stock_qty: z.coerce.number().min(0).default(0),
  is_limited: z.boolean().default(false),
  is_treasure_hunt: z.boolean().default(false),
  is_premium: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  is_active: z.boolean().default(true),
  image_url: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  sort_order: z.coerce.number().default(0),
})

export type ProductInput = z.infer<typeof productSchema>
