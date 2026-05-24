import prisma from "../lib/prisma";

interface ProductTranslationInput {
  name: string;
  description?: string;
}

interface CreateProductInput {
  price: number;
  stock: number;
  categoryId: string;
  images: string[];
  sellerId: string;
  translations: Record<string, ProductTranslationInput>;
}

export async function getProducts(options?: {
  locale?: string;
  categoryId?: string;
  sellerId?: string;
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
}) {
  const {
    locale = "ru",
    categoryId,
    sellerId,
    search,
    page = 1,
    limit = 12,
    isActive = true,
  } = options || {};

  const where: Record<string, unknown> = {};
  if (isActive !== undefined) where.isActive = isActive;
  if (categoryId) where.categoryId = categoryId;
  if (sellerId) where.sellerId = sellerId;
  if (search) {
    where.translations = {
      some: {
        locale,
        name: { contains: search, mode: "insensitive" },
      },
    };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        translations: { where: { locale } },
        category: {
          include: {
            translations: { where: { locale } },
          },
        },
        seller: {
          select: { id: true, name: true },
        },
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      price: Number(p.price),
      stock: p.stock,
      images: JSON.parse(p.images),
      isActive: p.isActive,
      name: p.translations[0]?.name || "Untitled",
      description: p.translations[0]?.description || "",
      categoryName: p.category.translations[0]?.name || "",
      categorySlug: p.category.slug,
      sellerName: p.seller.name || "Unknown",
      sellerId: p.seller.id,
      reviewCount: p._count.reviews,
      createdAt: p.createdAt,
    })),
    total,
    pages: Math.ceil(total / limit),
  };
}

export async function getProductBySlug(slug: string, locale: string = "ru") {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      translations: true,
      category: {
        include: { translations: true },
      },
      seller: {
        select: { id: true, name: true, avatar: true },
      },
      reviews: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) return null;

  const translation = product.translations.find((t) => t.locale === locale) ||
    product.translations[0];
  const categoryTranslation = product.category.translations.find(
    (t) => t.locale === locale
  ) || product.category.translations[0];

  return {
    id: product.id,
    slug: product.slug,
    price: Number(product.price),
    stock: product.stock,
    images: JSON.parse(product.images),
    isActive: product.isActive,
    name: translation?.name || "Untitled",
    description: translation?.description || "",
    categoryName: categoryTranslation?.name || "",
    categorySlug: product.category.slug,
    categoryId: product.categoryId,
    seller: product.seller,
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      user: r.user,
      createdAt: r.createdAt,
    })),
    avgRating:
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
          product.reviews.length
        : 0,
    createdAt: product.createdAt,
    allTranslations: product.translations,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createProduct(data: CreateProductInput) {
  const baseSlug = slugify(data.translations.en?.name || data.translations.ru?.name || "product");
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  return prisma.product.create({
    data: {
      slug,
      price: data.price,
      stock: data.stock,
      categoryId: data.categoryId,
      sellerId: data.sellerId,
      images: JSON.stringify(data.images),
      translations: {
        create: Object.entries(data.translations).map(([locale, t]) => ({
          locale,
          name: t.name,
          description: t.description || "",
        })),
      },
    },
    include: { translations: true },
  });
}

export async function updateProduct(
  id: string,
  data: Partial<CreateProductInput>
) {
  const updateData: Record<string, unknown> = {};
  if (data.price !== undefined) updateData.price = data.price;
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (data.categoryId) updateData.categoryId = data.categoryId;
  if (data.images) updateData.images = JSON.stringify(data.images);

  if (data.translations) {
    for (const [locale, t] of Object.entries(data.translations)) {
      await prisma.productTranslation.upsert({
        where: {
          productId_locale: { productId: id, locale },
        },
        update: { name: t.name, description: t.description || "" },
        create: {
          productId: id,
          locale,
          name: t.name,
          description: t.description || "",
        },
      });
    }
  }

  return prisma.product.update({
    where: { id },
    data: updateData,
    include: { translations: true },
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}

export async function toggleProductActive(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { isActive: true },
  });
  if (!product) throw new Error("Product not found");

  return prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive },
  });
}
