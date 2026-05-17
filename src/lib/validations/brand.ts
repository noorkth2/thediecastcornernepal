import { z } from 'zod'

export const brandSchema = z.object({
  name:        z.string().min(1, 'Brand name is required'),
  slug:        z.string().optional(),
  description: z.string().optional(),
  logo_url:    z.string().optional(),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  is_active:   z.boolean(),
  sort_order:  z.union([z.string(), z.number()]).optional(),
})

export type BrandFormData = z.infer<typeof brandSchema>
