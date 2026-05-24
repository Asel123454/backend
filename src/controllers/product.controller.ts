import { Request, Response } from "express";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
} from "../services/product.service";
import { productSchema } from "../lib/validations/product.schema";

/**
 * GET /api/products
 */
export async function listProducts(req: Request, res: Response): Promise<void> {
  const { locale, category, seller, search, page, limit, active } = req.query;

  const result = await getProducts({
    locale: (locale as string) || "ru",
    categoryId: category as string,
    sellerId: seller as string,
    search: search as string,
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 12,
    isActive: active === "all" ? undefined : (active !== undefined && active !== "" ? active === "true" : true),
  });

  res.json(result);
}

/**
 * GET /api/products/:slug
 */
export async function getProduct(req: Request, res: Response): Promise<void> {
  const locale = (req.query.locale as string) || "ru";
  const product = await getProductBySlug(req.params.slug as string, locale);

  if (!product) {
    res.status(404).json({ error: "Товар не найден" });
    return;
  }

  res.json(product);
}

/**
 * POST /api/products
 */
export async function createProductHandler(req: Request, res: Response): Promise<void> {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  try {
    const product = await createProduct({
      ...parsed.data,
      sellerId: req.user!.id,
    });
    res.status(201).json(product);
  } catch {
    res.status(500).json({ error: "Ошибка при создании товара" });
  }
}

/**
 * PUT /api/products/:id
 */
export async function updateProductHandler(req: Request, res: Response): Promise<void> {
  try {
    const product = await updateProduct(req.params.id as string, req.body);
    res.json(product);
  } catch {
    res.status(500).json({ error: "Ошибка при обновлении товара" });
  }
}

/**
 * DELETE /api/products/:id
 */
export async function deleteProductHandler(req: Request, res: Response): Promise<void> {
  try {
    await deleteProduct(req.params.id as string);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Ошибка при удалении товара" });
  }
}

/**
 * PATCH /api/products/:id/toggle
 */
export async function toggleProductHandler(req: Request, res: Response): Promise<void> {
  try {
    const product = await toggleProductActive(req.params.id as string);
    res.json(product);
  } catch {
    res.status(500).json({ error: "Ошибка при изменении статуса товара" });
  }
}
