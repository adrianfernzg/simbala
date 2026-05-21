import { z } from 'zod'

export const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      extras: z
        .array(
          z.object({
            extraId: z.string().min(1),
            value: z.string().optional(),
          })
        )
        .default([]),
      quantity: z.number().int().min(1).max(100),
    })
  ),
  isPickup: z.boolean(),
  shippingAddress: z
    .object({
      name: z.string().min(2),
      phone: z.string().optional(),
      address: z.string().min(5),
      city: z.string().min(2),
      zip: z.string().min(4),
      country: z.string().min(2),
    })
    .optional(),
})
