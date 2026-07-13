import {
  CATEGORY_MOCK_ROWS,
  computeCategoryStats,
} from "@/features/cms/constants/category.mock";
import type { CategoryFormSchema } from "@/features/cms/schema/category-form.schema";
import type {
  Category,
  CategoryStats,
} from "@/features/cms/types/category.types";

/** In-memory mock store — frontend only. Replace with real API later. */
let categoriesStore: Category[] = structuredClone(CATEGORY_MOCK_ROWS);
let nextId = CATEGORY_MOCK_ROWS.length + 1;

function delay(ms = 120): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function formatLastUpdated(date = new Date()): string {
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

function formToCategory(
  data: CategoryFormSchema,
  id: string,
  existing?: Category,
): Category {
  const slug = slugify(data.name) || id;

  return {
    id,
    name: data.name.trim(),
    displayOrder: data.displayOrder,
    productCount: existing?.productCount ?? 0,
    isVisible: data.isVisible,
    thumbnailUrl:
      existing?.thumbnailUrl ??
      `https://picsum.photos/seed/${slug}-category/80/80`,
    lastUpdated: formatLastUpdated(),
  };
}

export async function getCategories(): Promise<Category[]> {
  await delay();
  return structuredClone(categoriesStore);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  await delay();
  const category = categoriesStore.find((item) => item.id === id);
  return category ? structuredClone(category) : null;
}

export async function getCategoryStats(): Promise<CategoryStats> {
  await delay();
  return computeCategoryStats(categoriesStore);
}

export async function createCategory(
  data: CategoryFormSchema,
): Promise<Category> {
  await delay();
  const id = `cat-${String(nextId).padStart(3, "0")}`;
  nextId += 1;
  const category = formToCategory(data, id);
  categoriesStore = [...categoriesStore, category].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  return structuredClone(category);
}

export async function updateCategory(
  id: string,
  data: CategoryFormSchema,
): Promise<Category | null> {
  await delay();
  const index = categoriesStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated = formToCategory(data, id, categoriesStore[index]);
  categoriesStore = [
    ...categoriesStore.slice(0, index),
    updated,
    ...categoriesStore.slice(index + 1),
  ].sort((a, b) => a.displayOrder - b.displayOrder);

  return structuredClone(updated);
}

export async function deleteCategory(id: string): Promise<boolean> {
  await delay();
  const before = categoriesStore.length;
  categoriesStore = categoriesStore.filter((item) => item.id !== id);
  return categoriesStore.length < before;
}
