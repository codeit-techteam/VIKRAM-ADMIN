import { z } from "zod";

export const BANNER_CTA_DESTINATIONS = [
  "CATALOG",
  "CATEGORY",
  "PRODUCT",
  "CUSTOM",
] as const;

export type BannerCtaDestination = (typeof BANNER_CTA_DESTINATIONS)[number];

export const CATALOG_HOME_PATH = "/(tabs)/catalog";

export const bannerFormSchema = z
  .object({
    title: z.string().min(2, "Campaign title must be at least 2 characters"),
    subtitle: z.string().optional(),
    location: z.string().min(2, "Location / placement is required"),
    placement: z.string().optional(),
    ctaLabel: z.string().min(1, "CTA label is required"),
    /** Destination kind shown in the admin picker */
    ctaDestination: z.enum(BANNER_CTA_DESTINATIONS),
    /** Persisted app link type: ROUTE | CATEGORY | PRODUCT | … */
    linkType: z.string().min(1),
    /** Persisted target: path, category slug/id, or product id */
    ctaPath: z.string().min(1, "Please choose where Shop Now should go"),
    /** Optional display label for selected category/product */
    ctaTargetLabel: z.string().optional(),
    badge: z.string().optional(),
    ctaColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    bannerType: z.enum(["IMAGE", "VIDEO", "CAROUSEL", "CLICKABLE"]).optional(),
    imageUrl: z.string().optional(),
    mobileUrl: z.string().optional(),
    tabletUrl: z.string().optional(),
    desktopUrl: z.string().optional(),
    displayOrder: z.coerce.number().optional(),
    priority: z.coerce.number().optional(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    status: z.enum(["LIVE", "DRAFT"]),
  })
  .superRefine((data, ctx) => {
    if (data.ctaDestination === "CATEGORY" && !data.ctaPath.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["ctaPath"],
        message: "Select a category",
      });
    }
    if (data.ctaDestination === "PRODUCT" && !data.ctaPath.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["ctaPath"],
        message: "Select a product",
      });
    }
    if (data.ctaDestination === "CUSTOM" && !data.ctaPath.trim().startsWith("/")) {
      ctx.addIssue({
        code: "custom",
        path: ["ctaPath"],
        message: "Enter a path starting with /",
      });
    }
  });

export type BannerFormSchema = z.infer<typeof bannerFormSchema>;

export const BANNER_FORM_DEFAULT_VALUES: BannerFormSchema = {
  title: "",
  subtitle: "",
  location: "HOME_HERO",
  placement: "HOME_HERO",
  ctaLabel: "Shop Now",
  ctaDestination: "CATALOG",
  linkType: "ROUTE",
  ctaPath: CATALOG_HOME_PATH,
  ctaTargetLabel: "Catalog",
  badge: "",
  ctaColor: "#FEB623",
  backgroundColor: "",
  bannerType: "IMAGE",
  imageUrl: "",
  mobileUrl: "",
  tabletUrl: "",
  desktopUrl: "",
  displayOrder: 0,
  priority: 0,
  startsAt: "",
  endsAt: "",
  status: "DRAFT",
};

/** Infer picker state from stored linkType + linkTarget */
export function inferBannerCtaDestination(
  linkType?: string | null,
  linkTarget?: string | null,
): Pick<
  BannerFormSchema,
  "ctaDestination" | "linkType" | "ctaPath" | "ctaTargetLabel"
> {
  const type = (linkType || "ROUTE").toUpperCase();
  const target = (linkTarget || "").trim();

  if (type === "PRODUCT") {
    return {
      ctaDestination: "PRODUCT",
      linkType: "PRODUCT",
      ctaPath: target,
      ctaTargetLabel: "",
    };
  }

  if (type === "CATEGORY") {
    return {
      ctaDestination: "CATEGORY",
      linkType: "CATEGORY",
      ctaPath: target,
      ctaTargetLabel: target,
    };
  }

  if (
    !target ||
    target === CATALOG_HOME_PATH ||
    target === "/(tabs)/catalog/" ||
    target === "/catalog"
  ) {
    return {
      ctaDestination: "CATALOG",
      linkType: "ROUTE",
      ctaPath: CATALOG_HOME_PATH,
      ctaTargetLabel: "Catalog",
    };
  }

  // Legacy mistaken paths like /(tabs)/catalog/adhesives → treat as category slug
  const nestedCatalog = target.match(/^\/\(tabs\)\/catalog\/([^/?#]+)/);
  if (nestedCatalog?.[1]) {
    return {
      ctaDestination: "CATEGORY",
      linkType: "CATEGORY",
      ctaPath: nestedCatalog[1],
      ctaTargetLabel: nestedCatalog[1],
    };
  }

  const productsCategory = target.match(/^\/products\/(?!detail\/)([^/?#]+)/);
  if (productsCategory?.[1]) {
    return {
      ctaDestination: "CATEGORY",
      linkType: "CATEGORY",
      ctaPath: productsCategory[1],
      ctaTargetLabel: productsCategory[1],
    };
  }

  const productDetail = target.match(/^\/products\/detail\/([^/?#]+)/);
  if (productDetail?.[1]) {
    return {
      ctaDestination: "PRODUCT",
      linkType: "PRODUCT",
      ctaPath: productDetail[1],
      ctaTargetLabel: "",
    };
  }

  return {
    ctaDestination: "CUSTOM",
    linkType: "ROUTE",
    ctaPath: target || CATALOG_HOME_PATH,
    ctaTargetLabel: "",
  };
}
