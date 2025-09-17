import { z } from 'zod';

export const measurementItemSchema = z.object({
  height: z.number().nullable().optional(),
  chest: z.number().nullable().optional(),
  waist: z.number().nullable().optional(),
  hip: z.number().nullable().optional(),
  shoulder: z.number().nullable().optional(),
  sleeveLength: z.number().nullable().optional(),
  inseam: z.number().nullable().optional(),
  neck: z.number().nullable().optional(),
  armhole: z.number().nullable().optional(),
  bicep: z.number().nullable().optional(),
  wrist: z.number().nullable().optional(),
  outseam: z.number().nullable().optional(),
  thigh: z.number().nullable().optional(),
  knee: z.number().nullable().optional(),
  calf: z.number().nullable().optional(),
  ankle: z.number().nullable().optional(),
});

export const clothingItemSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  color: z.string().optional(),
  fabric: z.string().optional(),
  designNotes: z.string().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  videoUrls: z.array(z.string().url()).optional(),
  neck: z.number().nonnegative('Neck must be a non-negative number').optional(),
  measurements: z.array(measurementItemSchema).optional().nullable(),
});

export const costSchema = z.object({
  materialCost: z.number().nonnegative(),
  laborCost: z.number().nonnegative(),
  totalCost: z.number().nonnegative(),
});

export const formSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  shopId: z.string().min(1, 'Shop ID is required'),
  tailorName: z.string().min(1, 'Tailor name is required'),
  tailorNumber: z.string().min(1, 'Tailor number is required'),
  tailorId: z.string().optional(),
  status: z.enum(['NEW', 'PENDING', 'DELIVERED', 'CANCELLED', 'status']),
  orderDate: z.string(),
  deliveryDate: z.string().optional().nullable(),
  orderType: z.enum(['STITCHING', 'ALTERATION']).default('STITCHING'),
  alterationPrice: z.number().nonnegative().optional(),
  clothes: z.array(clothingItemSchema).min(1, 'At least one clothing item is required'),
  costs: z.array(costSchema).optional().default([{ materialCost: 0, laborCost: 0, totalCost: 0 }]),
}).refine((data) => {
  // If order type is ALTERATION, alteration price should be provided
  if (data.orderType === 'ALTERATION') {
    return data.alterationPrice !== undefined && data.alterationPrice > 0;
  }
  return true;
}, {
  message: "Alteration price is required for alteration orders",
  path: ["alterationPrice"],
});

export type OrderFormData = z.infer<typeof formSchema>;
export type MeasurementItem = z.infer<typeof measurementItemSchema>;
export type ClothingItem = z.infer<typeof clothingItemSchema>;
export type CostItem = z.infer<typeof costSchema>; 