import type {
  Category,
  CategoryStats,
} from "@/features/cms/types/category.types";

export const CATEGORY_MOCK_ROWS: Category[] = [
  {
    id: "cat-001",
    thumbnailUrl: "https://picsum.photos/seed/cement-category/80/80",
    name: "Cement",
    displayOrder: 1,
    productCount: 142,
    isVisible: true,
    lastUpdated: "24 Oct, 2023",
  },
  {
    id: "cat-002",
    thumbnailUrl: "https://picsum.photos/seed/steel-category/80/80",
    name: "Steel",
    displayOrder: 2,
    productCount: 86,
    isVisible: true,
    lastUpdated: "22 Oct, 2023",
  },
  {
    id: "cat-003",
    thumbnailUrl: "https://picsum.photos/seed/bricks-category/80/80",
    name: "Bricks & Masonry",
    displayOrder: 3,
    productCount: 54,
    isVisible: true,
    lastUpdated: "18 Oct, 2023",
  },
  {
    id: "cat-004",
    thumbnailUrl: "https://picsum.photos/seed/sand-category/80/80",
    name: "Sand",
    displayOrder: 4,
    productCount: 22,
    isVisible: false,
    lastUpdated: "15 Oct, 2023",
  },
];

export function computeCategoryStats(categories: Category[]): CategoryStats {
  return {
    totalCategories: categories.length,
    totalProducts: categories.reduce(
      (sum, category) => sum + category.productCount,
      0,
    ),
    visible: categories.filter((category) => category.isVisible).length,
    notVisible: categories.filter((category) => !category.isVisible).length,
  };
}

export const CATEGORY_STATS = computeCategoryStats(CATEGORY_MOCK_ROWS);

export const CATEGORY_FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Visible", value: "visible" },
  { label: "Not Visible", value: "not-visible" },
] as const;

export type CategoryFilterValue =
  (typeof CATEGORY_FILTER_TABS)[number]["value"];
