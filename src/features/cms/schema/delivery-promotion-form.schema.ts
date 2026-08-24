import { z } from "zod";

import {
  BANNER_CTA_DESTINATIONS,
  BANNER_TARGET_AUDIENCES,
  CATALOG_HOME_PATH,
  inferBannerCtaDestination,
  type BannerCtaDestination,
} from "@/features/cms/schema/banner-form.schema";

export const DELIVERY_PROMOTION_PLACEMENT = "HOME_TOP_DELIVERY_PROMOTION";

export const deliveryPromotionFormSchema = z
  .object({
    name: z.string().min(2, "Promotion name is required"),
    description: z.string().optional(),
    headline: z.string().min(2, "Headline is required"),
    subtitle: z.string().optional(),
    badge: z.string().optional(),
    remainingHeadline: z.string().optional(),
    exhaustedHeadline: z.string().optional(),
    exhaustedBehavior: z.enum(["HIDE", "SHOW_ALTERNATE"]),
    placement: z.literal(DELIVERY_PROMOTION_PLACEMENT),
    status: z.enum(["DRAFT", "SCHEDULED", "ACTIVE", "INACTIVE"]),
    priority: z.coerce.number().min(1, "Minimum priority is 1").max(100),
    targetAudience: z.enum(BANNER_TARGET_AUDIENCES),
    bannerImage: z.string().optional(),
    mobileBannerImage: z.string().optional(),
    desktopBannerImage: z.string().optional(),
    ctaEnabled: z.boolean(),
    ctaLabel: z.string().optional(),
    ctaDestination: z.enum(BANNER_CTA_DESTINATIONS),
    linkType: z.string().optional(),
    ctaPath: z.string().optional(),
    ctaTargetLabel: z.string().optional(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const publishing =
      data.status === "ACTIVE" || data.status === "SCHEDULED";
    const hasImage = Boolean(
      data.mobileBannerImage?.trim() || data.bannerImage?.trim(),
    );
    if (publishing && !hasImage) {
      ctx.addIssue({
        code: "custom",
        path: ["mobileBannerImage"],
        message: "Upload a mobile banner before publishing",
      });
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
    if (data.status === "SCHEDULED" && !data.startsAt) {
      ctx.addIssue({
        code: "custom",
        path: ["startsAt"],
        message: "Start date is required for scheduled promotions",
      });
    }
    if (!data.ctaEnabled) return;

    if (!data.ctaLabel?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["ctaLabel"],
        message: "CTA label is required when CTA is enabled",
      });
    }
    if (!data.ctaPath?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["ctaPath"],
        message: "Choose a CTA destination",
      });
    }
    if (data.ctaDestination === "EXTERNAL") {
      const target = data.ctaPath?.trim() ?? "";
      if (!/^https?:\/\//i.test(target)) {
        ctx.addIssue({
          code: "custom",
          path: ["ctaPath"],
          message: "Enter a full URL starting with https://",
        });
      }
    }
  });

export type DeliveryPromotionFormSchema = z.infer<
  typeof deliveryPromotionFormSchema
>;

export const DELIVERY_PROMOTION_FORM_DEFAULTS: DeliveryPromotionFormSchema = {
  name: "",
  description: "",
  headline: "Get 3 FREE Bike deliveries",
  subtitle: "on your first three orders",
  badge: "FREE DELIVERY",
  remainingHeadline: "{count} FREE Bike {delivery} remaining",
  exhaustedHeadline: "",
  exhaustedBehavior: "HIDE",
  placement: DELIVERY_PROMOTION_PLACEMENT,
  status: "DRAFT",
  priority: 10,
  targetAudience: "FREE_BIKE_REMAINING",
  bannerImage: "",
  mobileBannerImage: "",
  desktopBannerImage: "",
  ctaEnabled: false,
  ctaLabel: "Shop Now",
  ctaDestination: "CATALOG",
  linkType: "ROUTE",
  ctaPath: CATALOG_HOME_PATH,
  ctaTargetLabel: "Catalog",
  startsAt: "",
  endsAt: "",
};

export function inferDeliveryPromotionCta(
  linkType?: string | null,
  linkTarget?: string | null,
): Pick<
  DeliveryPromotionFormSchema,
  "ctaDestination" | "linkType" | "ctaPath" | "ctaTargetLabel"
> {
  return inferBannerCtaDestination(linkType, linkTarget) as Pick<
    DeliveryPromotionFormSchema,
    "ctaDestination" | "linkType" | "ctaPath" | "ctaTargetLabel"
  >;
}

export type { BannerCtaDestination };
