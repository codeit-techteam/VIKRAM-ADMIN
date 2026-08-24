import { z } from "zod";

import { BANNER_CTA_DESTINATIONS } from "@/features/cms/schema/banner-form.schema";

export function clampVideoPriority(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 8;
  return Math.min(10, Math.max(1, Math.round(n)));
}

export const videoUploadSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    category: z.string().min(1, "Select a category"),
    targetAudience: z.string().min(1, "Select a target audience"),
    placements: z.array(z.string()).min(1, "Select at least one app placement"),
    priorityLevel: z.unknown().transform(clampVideoPriority),
    publishImmediately: z.boolean(),
    scheduledAt: z.string().optional(),
    ctaEnabled: z.boolean(),
    ctaLabel: z.string().optional(),
    ctaDestination: z.enum(BANNER_CTA_DESTINATIONS),
    linkType: z.string().optional(),
    ctaPath: z.string().optional(),
    ctaTargetLabel: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.ctaEnabled) {
      return;
    }

    if (!data.ctaLabel || data.ctaLabel.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CTA label must be at least 2 characters",
        path: ["ctaLabel"],
      });
    }

    if (!data.ctaPath || data.ctaPath.trim().length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose where the button should open in the app",
        path: ["ctaPath"],
      });
    }

    if (data.ctaDestination === "PRODUCT" && !data.ctaPath?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a product to open",
        path: ["ctaPath"],
      });
    }

    if (data.ctaDestination === "CATEGORY" && !data.ctaPath?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a category to open",
        path: ["ctaPath"],
      });
    }
  });

export type VideoUploadSchema = z.infer<typeof videoUploadSchema>;
