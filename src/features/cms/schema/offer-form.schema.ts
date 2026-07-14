import { z } from "zod";

export const offerFormSchema = z
  .object({
    name: z.string().min(2, "Offer name must be at least 2 characters"),
    slug: z
      .string()
      .min(2, "Slug is required")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase with hyphens only",
      ),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    status: z.enum(["ACTIVE", "SCHEDULED", "EXPIRED", "DRAFT"]),
    priority: z
      .number()
      .int()
      .min(1, "Priority must be at least 1")
      .max(10, "Priority must be at most 10"),
    offerType: z.enum(["home-carousel", "featured"]),
    productIds: z.array(z.string()).min(1, "Select at least one product"),
    ctaLabel: z.enum(["Shop Now", "Buy Now", "Explore", "View Offer"]),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    desktopBanner: z.string().optional(),
    mobileBanner: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    },
  );

export type OfferFormSchema = z.infer<typeof offerFormSchema>;
