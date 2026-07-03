import { z } from "zod";

export const videoUploadSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Select a category"),
    targetAudience: z.string().min(1, "Select a target audience"),
    placements: z.array(z.string()).min(1, "Select at least one app placement"),
    priorityLevel: z.number().min(1).max(10),
    publishImmediately: z.boolean(),
    scheduledAt: z.string().optional(),
    ctaEnabled: z.boolean(),
    ctaLabel: z.string().optional(),
    ctaPath: z.string().optional(),
    ctaDestinationType: z.enum(["product", "category", "offer", "external"]),
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
        message: "Select or enter a redirect destination",
        path: ["ctaPath"],
      });
    }
  });

export type VideoUploadSchema = z.infer<typeof videoUploadSchema>;
