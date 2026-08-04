import { z } from "zod";

export const bannerFormSchema = z.object({
  title: z.string().min(2, "Campaign title must be at least 2 characters"),
  subtitle: z.string().optional(),
  location: z.string().min(2, "Location / placement is required"),
  placement: z.string().optional(),
  ctaLabel: z.string().min(1, "CTA label is required"),
  ctaPath: z.string().min(1, "Deep link / redirect path is required"),
  linkType: z.string().optional(),
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
});

export type BannerFormSchema = z.infer<typeof bannerFormSchema>;

export const BANNER_FORM_DEFAULT_VALUES: BannerFormSchema = {
  title: "",
  subtitle: "",
  location: "HOME_HERO",
  placement: "HOME_HERO",
  ctaLabel: "Shop Now",
  ctaPath: "/(tabs)/catalog",
  linkType: "ROUTE",
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
