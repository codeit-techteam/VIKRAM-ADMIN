import { z } from "zod";

export const bannerFormSchema = z.object({
  title: z.string().min(2, "Campaign title must be at least 2 characters"),
  location: z.string().min(2, "Location / targeting is required"),
  ctaLabel: z.string().min(1, "CTA label is required"),
  ctaPath: z
    .string()
    .min(1, "Redirect path is required")
    .regex(/^\//, "Path must start with /"),
  status: z.enum(["LIVE", "DRAFT"]),
});

export type BannerFormSchema = z.infer<typeof bannerFormSchema>;

export const BANNER_FORM_DEFAULT_VALUES: BannerFormSchema = {
  title: "",
  location: "",
  ctaLabel: "Shop Now",
  ctaPath: "/",
  status: "DRAFT",
};
