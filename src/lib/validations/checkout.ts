import { z } from 'zod'
import { PAYMENT_METHODS } from '@/lib/constants'

const paymentMethodIds = PAYMENT_METHODS.map((p) => p.id) as [string, ...string[]]

export const checkoutSchema = z.object({
  shippingAddress: z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().min(10, 'Valid phone number required'),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    landmark: z.string().optional(),
  }),
  paymentMethod: z.enum(paymentMethodIds),
  items: z.array(
    z.object({
      product_id: z.number(),
      product_title: z.string(),
      product_image: z.string(),
      product_brand: z.string().nullable(),
      quantity: z.number().min(1),
      unit_price: z.number().min(0),
    })
  ).min(1, 'Cart cannot be empty'),
  notes: z.string().max(500).optional(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
