import type { Category } from "@/features/cms/types/category.types";

export const CATEGORY_MOCK_ROWS: Category[] = [
  {
    id: "cat-001",
    thumbnailUrl: "https://picsum.photos/seed/cement-category/80/80",
    name: "Cement",
    displayOrder: 1,
    productCount: 142,
    status: "ACTIVE",
    lastUpdated: "24 Oct, 2023",
  },
  {
    id: "cat-002",
    thumbnailUrl: "https://picsum.photos/seed/steel-category/80/80",
    name: "Steel",
    displayOrder: 2,
    productCount: 86,
    status: "ACTIVE",
    lastUpdated: "22 Oct, 2023",
  },
  {
    id: "cat-003",
    thumbnailUrl: "https://picsum.photos/seed/bricks-category/80/80",
    name: "Bricks & Masonry",
    displayOrder: 3,
    productCount: 54,
    status: "ACTIVE",
    lastUpdated: "18 Oct, 2023",
  },
  {
    id: "cat-004",
    thumbnailUrl: "https://picsum.photos/seed/sand-category/80/80",
    name: "Sand",
    displayOrder: 4,
    productCount: 22,
    status: "PENDING",
    lastUpdated: "15 Oct, 2023",
  },
];

export const CATEGORY_STATS = {
  total: 24,
  active: 18,
  hidden: 4,
  pending: 2,
} as const;

export const CATEGORY_TOTAL_COUNT = 24;
export const CATEGORY_DISPLAYED_COUNT = 8;

export const CATEGORY_FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
] as const;

export type CategoryFilterValue =
  (typeof CATEGORY_FILTER_TABS)[number]["value"];
