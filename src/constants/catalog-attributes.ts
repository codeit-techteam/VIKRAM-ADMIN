/**
 * Stable catalog attribute codes for category-specific product fields.
 * Keep in sync with Vikram-Backend `catalog.constants.ts`.
 */

export const BRICK_PRODUCT_TYPES = {
  RED_BRICKS: "RED_BRICKS",
  GREY_ASH_BRICKS: "GREY_ASH_BRICKS",
} as const;

export type BrickProductType =
  (typeof BRICK_PRODUCT_TYPES)[keyof typeof BRICK_PRODUCT_TYPES];

export const BRICK_GRADES = {
  A_PLUS: "A_PLUS",
  A: "A",
  B_PLUS: "B_PLUS",
} as const;

export type BrickGrade = (typeof BRICK_GRADES)[keyof typeof BRICK_GRADES];

export const BRICK_PRODUCT_TYPE_VALUES = Object.values(BRICK_PRODUCT_TYPES);
export const BRICK_GRADE_VALUES = Object.values(BRICK_GRADES);

export const BRICK_PRODUCT_TYPE_LABELS: Record<BrickProductType, string> = {
  RED_BRICKS: "Red Bricks",
  GREY_ASH_BRICKS: "Grey Ash Bricks (Fly Ash Bricks)",
};

export const BRICK_GRADE_LABELS: Record<BrickGrade, string> = {
  A_PLUS: "A+",
  A: "A",
  B_PLUS: "B+",
};

export const BRICK_PRODUCT_TYPE_OPTIONS = BRICK_PRODUCT_TYPE_VALUES.map(
  (value) => ({
    value,
    label: BRICK_PRODUCT_TYPE_LABELS[value],
  }),
);

export const BRICK_GRADE_OPTIONS = BRICK_GRADE_VALUES.map((value) => ({
  value,
  label: BRICK_GRADE_LABELS[value],
}));

export const CATEGORY_SLUGS = {
  RMC: "rmc",
  BRICKS: "bricks",
  CEMENT: "cement",
  STEEL_LEGACY: "steel",
} as const;

export function isBricksCategory(category?: {
  slug?: string | null;
  name?: string | null;
} | null): boolean {
  if (!category) return false;
  const slug = (category.slug ?? "").toLowerCase().trim();
  const name = (category.name ?? "").toLowerCase().trim();
  return (
    slug === CATEGORY_SLUGS.BRICKS ||
    name === "bricks" ||
    name === "bricks & blocks" ||
    name.startsWith("brick")
  );
}

export function isRmcCategory(category?: {
  slug?: string | null;
  name?: string | null;
} | null): boolean {
  if (!category) return false;
  const slug = (category.slug ?? "").toLowerCase().trim();
  const name = (category.name ?? "").toLowerCase().trim();
  return (
    slug === CATEGORY_SLUGS.RMC ||
    slug === CATEGORY_SLUGS.STEEL_LEGACY ||
    name === "rmc" ||
    name === "steel"
  );
}
