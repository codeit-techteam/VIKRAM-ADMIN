import { z } from "zod";

export const BANNER_CTA_DESTINATIONS = [
  "HOME",
  "CATALOG",
  "CATEGORY",
  "PRODUCT",
  "OFFERS",
  "BULK",
  "LOYALTY",
  "EXTERNAL",
  "CUSTOM",
] as const;

export type BannerCtaDestination = (typeof BANNER_CTA_DESTINATIONS)[number];

export const BANNER_TARGET_AUDIENCES = [
  "ALL",
  "NEW_CUSTOMERS",
  "FREE_BIKE_REMAINING",
  "FREE_BIKE_EXHAUSTED",
] as const;

export const CATALOG_HOME_PATH = "/(tabs)/catalog";
export const APP_HOME_PATH = "/(tabs)";
export const LOYALTY_PATH = "/account/loyalty";
export const BULK_PATH = "/bulk-procurement";

export const bannerFormSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    title: z.string().min(2, "Banner title must be at least 2 characters"),
    subtitle: z.string().optional(),
    location: z.string().min(2, "Location / placement is required"),
    placement: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaDestination: z.enum(BANNER_CTA_DESTINATIONS),
    linkType: z.string().min(1),
    ctaPath: z.string().min(1, "Choose a CTA destination"),
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
    priority: z.coerce.number().min(1, "Priority 1 is highest"),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    status: z.enum(["ACTIVE", "DRAFT", "INACTIVE"]),
    targetAudience: z.enum(BANNER_TARGET_AUDIENCES),
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
    if (data.ctaDestination === "EXTERNAL") {
      const target = data.ctaPath.trim();
      if (!/^https?:\/\//i.test(target)) {
        ctx.addIssue({
          code: "custom",
          path: ["ctaPath"],
          message: "Enter a full URL starting with https://",
        });
      }
    }
    if (data.startsAt && data.endsAt) {
      const start = new Date(data.startsAt).getTime();
      const end = new Date(data.endsAt).getTime();
      if (Number.isFinite(start) && Number.isFinite(end) && end < start) {
        ctx.addIssue({
          code: "custom",
          path: ["endsAt"],
          message: "End date must be after start date",
        });
      }
    }
    const publishing = data.status === "ACTIVE";
    const hasImage = Boolean(
      data.imageUrl?.trim() || data.mobileUrl?.trim() || data.desktopUrl?.trim(),
    );
    if (publishing && !hasImage) {
      ctx.addIssue({
        code: "custom",
        path: ["mobileUrl"],
        message:
          "Upload a product or illustration before publishing. It appears on the right of the banner.",
      });
    }
  });

export type BannerFormSchema = z.infer<typeof bannerFormSchema>;

export const BANNER_FORM_DEFAULT_VALUES: BannerFormSchema = {
  name: "",
  description: "",
  title: "",
  subtitle: "",
  location: "HOME_PROMO",
  placement: "HOME_PROMO",
  ctaLabel: "Shop Now",
  ctaDestination: "CATALOG",
  linkType: "ROUTE",
  ctaPath: CATALOG_HOME_PATH,
  ctaTargetLabel: "Catalog",
  badge: "",
  ctaColor: "#111111",
  backgroundColor: "#FFF6E8",
  bannerType: "IMAGE",
  imageUrl: "",
  mobileUrl: "",
  tabletUrl: "",
  desktopUrl: "",
  displayOrder: 0,
  priority: 1,
  startsAt: "",
  endsAt: "",
  status: "DRAFT",
  targetAudience: "ALL",
};

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

  if (type === "MEMBERSHIP" || target === "/membership") {
    return {
      ctaDestination: "LOYALTY",
      linkType: "ROUTE",
      ctaPath: LOYALTY_PATH,
      ctaTargetLabel: "Loyalty",
    };
  }

  if (type === "BULK_INQUIRY" || target === BULK_PATH) {
    return {
      ctaDestination: "BULK",
      linkType: "BULK_INQUIRY",
      ctaPath: BULK_PATH,
      ctaTargetLabel: "Bulk enquiry",
    };
  }

  if (type === "EXTERNAL" || /^https?:\/\//i.test(target)) {
    return {
      ctaDestination: "EXTERNAL",
      linkType: "EXTERNAL",
      ctaPath: target,
      ctaTargetLabel: "External URL",
    };
  }

  if (target === APP_HOME_PATH || target === "/" || target === "/(tabs)/index") {
    return {
      ctaDestination: "HOME",
      linkType: "ROUTE",
      ctaPath: APP_HOME_PATH,
      ctaTargetLabel: "Home",
    };
  }

  if (target === LOYALTY_PATH) {
    return {
      ctaDestination: "LOYALTY",
      linkType: "ROUTE",
      ctaPath: LOYALTY_PATH,
      ctaTargetLabel: "Loyalty",
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
