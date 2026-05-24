import { z } from "zod";

export const productSchema = z.object({
  price: z.coerce.number().positive("Цена должна быть положительной"),
  stock: z.coerce.number().int().min(0, "Количество не может быть отрицательным"),
  categoryId: z.string().min(1, "Выберите категорию"),
  images: z.array(z.string()).default([]),
  translations: z.object({
    kg: z.object({
      name: z.string().min(1, "Аталышын жазыңыз"),
      description: z.string().optional(),
    }),
    ru: z.object({
      name: z.string().min(1, "Введите название"),
      description: z.string().optional(),
    }),
    en: z.object({
      name: z.string().min(1, "Enter product name"),
      description: z.string().optional(),
    }),
  }),
});

export const productUpdateSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
