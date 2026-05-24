import { Request, Response } from "express";
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/category.service";
import { categorySchema } from "../lib/validations/category.schema";

/**
 * GET /api/categories
 */
export async function listCategories(req: Request, res: Response): Promise<void> {
  const locale = (req.query.locale as string) || "ru";
  const categories = await getCategories(locale);
  res.json(categories);
}

/**
 * GET /api/categories/:slug
 */
export async function getCategory(req: Request, res: Response): Promise<void> {
  const locale = (req.query.locale as string) || "ru";
  const category = await getCategoryBySlug(req.params.slug as string, locale);

  if (!category) {
    res.status(404).json({ error: "Категория не найдена" });
    return;
  }

  res.json(category);
}

/**
 * POST /api/categories
 */
export async function createCategoryHandler(req: Request, res: Response): Promise<void> {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  try {
    const category = await createCategory(parsed.data);
    res.status(201).json(category);
  } catch {
    res.status(500).json({ error: "Ошибка при создании категории" });
  }
}

/**
 * PUT /api/categories/:id
 */
export async function updateCategoryHandler(req: Request, res: Response): Promise<void> {
  try {
    const category = await updateCategory(req.params.id as string, req.body);
    res.json(category);
  } catch {
    res.status(500).json({ error: "Ошибка при обновлении категории" });
  }
}

/**
 * DELETE /api/categories/:id
 */
export async function deleteCategoryHandler(req: Request, res: Response): Promise<void> {
  try {
    await deleteCategory(req.params.id as string);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Ошибка при удалении категории" });
  }
}
