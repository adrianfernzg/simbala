import { z } from 'zod'

export const addToCartSchema = z.object({
  productId: z.string().cuid(),
  extras: z
    .array(
      z.object({
        extraId: z.string().cuid(),
        value: z.string().optional(),
      })
    )
    .optional(),
  quantity: z.number().int().min(1).max(100),
})
