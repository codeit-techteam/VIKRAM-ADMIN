import { z } from "zod";

export const offerFormSchema = z
  .object({
    name: z.string().min(2, "Offer name must be at least 2 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    startingFrom: z.preprocess(
      (value) => {
        if (value === "" || value === null || value === undefined) return null;
        const n = Number(value);
        return Number.isFinite(n) ? n : value;
      },
      z
        .number()
        .positive("Enter a valid starting price")
        .nullable()
        .optional(),
    ),
    status: z.enum(["ACTIVE", "SCHEDULED", "EXPIRED", "DRAFT", "INACTIVE"]),
    priority: z
      .number()
      .int()
      .min(1, "Priority must be at least 1")
      .max(10, "Priority must be at most 10"),
    offerType: z.enum(["home-carousel", "featured"]),
    productIds: z.array(z.string()).min(1, "Select at least one product"),
    ctaLabel: z.enum([
      "Shop Now",
      "Buy Now",
      "Explore Offer",
      "View Products",
      "View Details",
    ]),
    badge: z
      .enum(["", "HOT DEAL", "LIMITED TIME", "BULK OFFER", "BEST VALUE"])
      .optional(),
    targetAudience: z
      .enum([
        "ALL",
        "NEW_CUSTOMERS",
        "EXISTING_CUSTOMERS",
        "CONTRACTORS",
        "MASONS",
        "INTERIOR_DESIGNERS",
        "ARCHITECTS",
        "BUILDERS",
        "DEVELOPERS",
        "MEMBERSHIP_TIER",
        "CUSTOM_SEGMENT",
      ])
      .default("ALL"),
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
