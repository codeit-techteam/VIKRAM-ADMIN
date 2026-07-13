import { ROUTES } from "@/constants/routes";
import type {
  CmsStatCardData,
  ContentUpdate,
  QuickActionData,
} from "@/features/cms/types/cms.types";

export const CMS_STAT_CARDS: CmsStatCardData[] = [
  {
    label: "ACTIVE PRODUCTS",
    value: "1,240",
    href: `${ROUTES.CUSTOMER_APP_CMS}/catalog`,
  },
  {
    label: "CATALOGS",
    value: "18",
    href: `${ROUTES.CUSTOMER_APP_CMS}/catalog`,
  },
  {
    label: "ACTIVE OFFERS",
    value: "12",
    href: `${ROUTES.CUSTOMER_APP_CMS}/offers`,
  },
  {
    label: "CUSTOMERS",
    value: "12.4k",
    href: ROUTES.USER_MANAGEMENT_CUSTOMERS,
  },
  {
    label: "NOTIFICATIONS",
    value: "86",
    href: `${ROUTES.CUSTOMER_APP_CMS}/push-notifications`,
  },
];

export const CMS_QUICK_ACTIONS: QuickActionData[] = [
  {
    id: "add-product",
    label: "Add Product",
    iconName: "shopping-cart",
    circleColor: "orange",
    href: `${ROUTES.CUSTOMER_APP_CMS}/catalog/new`,
  },
  {
    id: "upload-banner",
    label: "Upload Banner",
    iconName: "upload",
    circleColor: "blue",
    href: `${ROUTES.CUSTOMER_APP_CMS}/banners`,
  },
  {
    id: "send-notification",
    label: "Send Notification",
    iconName: "send",
    circleColor: "indigo",
    href: `${ROUTES.CUSTOMER_APP_CMS}/push-notifications`,
  },
  {
    id: "create-offer",
    label: "Create Offer",
    iconName: "tag",
    circleColor: "green",
    href: `${ROUTES.CUSTOMER_APP_CMS}/offers/create`,
  },
];

export const CONTENT_UPDATES: ContentUpdate[] = [
  {
    id: "1",
    assetName: "Winter Monsoon Sale Banner",
    subtitle: "Home Screen Carousel",
    thumbnailUrl: "https://picsum.photos/seed/winter-banner/80/80",
    type: "Banner",
    status: "Live",
    updatedBy: "Arjun Sharma",
    lastModified: "2h ago",
    href: `${ROUTES.CUSTOMER_APP_CMS}/banners`,
  },
  {
    id: "2",
    assetName: "Structural Steel Grade A",
    subtitle: "Premium Category Update",
    thumbnailUrl: "https://picsum.photos/seed/steel-category/80/80",
    type: "Category",
    status: "Draft",
    updatedBy: "Priya V.",
    lastModified: "5h ago",
    href: `${ROUTES.CUSTOMER_APP_CMS}/categories`,
  },
  {
    id: "3",
    assetName: "Bulk Cement Discount",
    subtitle: "Flash Offer",
    thumbnailUrl: "https://picsum.photos/seed/cement-offer/80/80",
    type: "Offer",
    status: "Expired",
    updatedBy: "System",
    lastModified: "Yesterday",
    href: `${ROUTES.CUSTOMER_APP_CMS}/offers`,
  },
];
