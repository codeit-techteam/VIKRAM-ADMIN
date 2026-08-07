import type { CategoryFormSchema } from "@/features/cms/schema/category-form.schema";
import type {
  Category,
  CategoryStats,
} from "@/features/cms/types/category.types";
import { catalogService } from "@/services/catalog.service";

function formatLastUpdated(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mapCategory(row: {
  id: string;
  name: string;
  imageUrl?: string | null;
  iconUrl?: string | null;
  displayOrder?: number;
  isVisible?: boolean;
  status?: string;
  updatedAt?: string;
  _count?: { products?: number };
}): Category {
  return {
    id: row.id,
    name: row.name,
    displayOrder: row.displayOrder ?? 0,
    productCount: row._count?.products ?? 0,
    isVisible: row.isVisible !== false && row.status !== "INACTIVE",
    thumbnailUrl: row.iconUrl || row.imageUrl || "",
    lastUpdated: formatLastUpdated(row.updatedAt),
  };
}

export function computeCategoryStats(categories: Category[]): CategoryStats {
  return {
    totalCategories: categories.length,
    empty: categories.filter((c) => c.productCount === 0).length,
    visible: categories.filter((c) => c.isVisible).length,
    notVisible: categories.filter((c) => !c.isVisible).length,
  };
}

export async function getCategories(): Promise<Category[]> {
  const rows = await catalogService.listCategories();
  return rows.map(mapCategory);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const row = await catalogService.getCategory(id);
    return mapCategory(row);
  } catch {
    return null;
  }
}

export async function getCategoryStats(): Promise<CategoryStats> {
  const categories = await getCategories();
  return computeCategoryStats(categories);
}

export async function createCategory(
  data: CategoryFormSchema & { iconUrl?: string; imageUrl?: string },
): Promise<Category> {
  const created = await catalogService.createCategory({
    name: data.name.trim(),
    slug: slugify(data.name),
    displayOrder: data.displayOrder,
    status: data.isVisible ? "ACTIVE" : "INACTIVE",
    imageUrl: data.imageUrl,
    iconUrl: data.iconUrl,
  });
  if (!data.isVisible) {
    await catalogService.updateCategory(created.id, {
      isVisible: false,
      status: "INACTIVE",
    });
  }
  return mapCategory({
    ...created,
    isVisible: data.isVisible,
    _count: { products: 0 },
  });
}

export async function updateCategory(
  id: string,
  data: CategoryFormSchema & { iconUrl?: string; imageUrl?: string },
): Promise<Category | null> {
  const updated = await catalogService.updateCategory(id, {
    name: data.name.trim(),
    displayOrder: data.displayOrder,
    isVisible: data.isVisible,
    status: data.isVisible ? "ACTIVE" : "INACTIVE",
    ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
    ...(data.iconUrl ? { iconUrl: data.iconUrl } : {}),
  });
  return mapCategory({
    ...updated,
    isVisible: data.isVisible,
  });
}

export async function deleteCategory(id: string): Promise<boolean> {
  await catalogService.deleteCategory(id);
  return true;
}

export async function toggleCategoryVisibility(
  id: string,
): Promise<Category | null> {
  const updated = await catalogService.toggleCategory(id);
  return mapCategory(updated);
}
