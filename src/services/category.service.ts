import prisma from "../lib/prisma";

export async function getCategories(locale: string = "ru") {
  const categories = await prisma.category.findMany({
    include: {
      translations: { where: { locale } },
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    image: c.image,
    name: c.translations[0]?.name || c.slug,
    description: c.translations[0]?.description || "",
    productCount: c._count.products,
  }));
}

export async function getCategoryBySlug(slug: string, locale: string = "ru") {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      translations: true,
    },
  });

  if (!category) return null;

  const translation = category.translations.find((t) => t.locale === locale) ||
    category.translations[0];

  return {
    id: category.id,
    slug: category.slug,
    image: category.image,
    name: translation?.name || category.slug,
    description: translation?.description || "",
  };
}

interface CategoryTranslationInput {
  name: string;
  description?: string;
}

export async function createCategory(data: {
  slug: string;
  image?: string;
  translations: Record<string, CategoryTranslationInput>;
}) {
  return prisma.category.create({
    data: {
      slug: data.slug,
      image: data.image,
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

export async function updateCategory(
  id: string,
  data: {
    slug?: string;
    image?: string;
    translations?: Record<string, CategoryTranslationInput>;
  }
) {
  if (data.translations) {
    for (const [locale, t] of Object.entries(data.translations)) {
      await prisma.categoryTranslation.upsert({
        where: { categoryId_locale: { categoryId: id, locale } },
        update: { name: t.name, description: t.description || "" },
        create: {
          categoryId: id,
          locale,
          name: t.name,
          description: t.description || "",
        },
      });
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.slug) updateData.slug = data.slug;
  if (data.image !== undefined) updateData.image = data.image;

  return prisma.category.update({
    where: { id },
    data: updateData,
    include: { translations: true },
  });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}
