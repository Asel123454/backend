import { z } from "zod";

export const categorySchema = z.object({
  slug: z.string().min(1, "Введите slug"),
  image: z.string().optional(),
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
      name: z.string().min(1, "Enter category name"),
      description: z.string().optional(),
    }),
  }),
});

export type CategoryInput = z.infer<typeof categorySchema>;
