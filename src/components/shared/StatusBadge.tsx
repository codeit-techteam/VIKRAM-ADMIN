import { cva, type VariantProps } from "class-variance-authority";

import type {
  BannerStatus,
  ModificationStatus,
} from "@/features/cms/types/banner.types";
import type { VideoStatus } from "@/features/cms/types/video.types";
import type { ContentUpdateStatus } from "@/features/cms/types/cms.types";
import type { CategoryStatus } from "@/features/cms/types/category.types";
import type { OfferStatus } from "@/features/cms/types/offer.types";
import type { ProductStatus } from "@/features/catalog/types/product.types";
import type {
  OrderSource,
  OrderStatus,
} from "@/features/dashboard/types/dashboard.types";
import type { NotificationStatus } from "@/features/notifications/types/notification.types";
import { cn } from "@/lib/utils";

type TableStatus =
  | OrderStatus
  | OrderSource
  | ContentUpdateStatus
  | BannerStatus
  | ModificationStatus
  | VideoStatus
  | ProductStatus
  | CategoryStatus
  | OfferStatus
  | NotificationStatus
  | AnalyticsStatusLabel;

type AnalyticsStatusLabel = "TOP_PERFORMER" | "STEADY" | "NEEDS_REVIEW";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        success:
          "inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-white uppercase backdrop-blur-md bg-black/50",
        warning:
          "inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-amber-100 uppercase backdrop-blur-md bg-amber-950/60",
        neutral:
          "inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-white/80 uppercase backdrop-blur-md bg-black/40",
        DISPATCHED: "bg-blue-100 text-blue-700",
        PROCESSING: "bg-blue-100 text-blue-700",
        DELIVERED: "bg-slate-100 text-slate-600",
        "AWAITING HUB": "bg-orange-100 text-orange-700",
        App: "bg-blue-50 text-blue-600 border border-blue-100",
        Exec: "bg-orange-50 text-orange-600 border border-orange-100",
        Live: "bg-green-100 text-green-700",
        Draft: "bg-slate-100 text-slate-600",
        Expired: "bg-red-100 text-red-700",
        LIVE: "bg-green-100 text-green-700",
        LOW_STOCK: "bg-red-100 text-red-700",
        DRAFT: "bg-slate-100 text-slate-600",
        ACTIVE: "bg-green-100 text-green-700",
        PENDING: "bg-amber-100 text-amber-700",
        INACTIVE: "bg-slate-100 text-slate-600",
        SCHEDULED: "bg-amber-100 text-amber-700",
        EXPIRED: "bg-red-100 text-red-700",
        PUBLISHED: "bg-emerald-600 text-white",
        TOP_PERFORMER: "bg-green-100 text-green-700",
        STEADY: "bg-blue-100 text-blue-700",
        NEEDS_REVIEW: "bg-amber-100 text-amber-700",
        SENT: "bg-green-100 text-green-700",
      },
    },
    defaultVariants: {
      variant: "success",
    },
  },
);

const dotVariants = cva("size-2 shrink-0 rounded-full", {
  variants: {
    variant: {
      success: "animate-pulse bg-primary",
      warning: "animate-pulse bg-amber-400",
      neutral: "bg-white/60",
      DISPATCHED: "hidden",
      PROCESSING: "hidden",
      DELIVERED: "hidden",
      "AWAITING HUB": "hidden",
      App: "hidden",
      Exec: "hidden",
      Live: "hidden",
      Draft: "hidden",
      Expired: "hidden",
      LIVE: "hidden",
      LOW_STOCK: "hidden",
      DRAFT: "hidden",
      ACTIVE: "hidden",
      PENDING: "hidden",
      INACTIVE: "hidden",
      SCHEDULED: "hidden",
      EXPIRED: "hidden",
      PUBLISHED: "hidden",
      TOP_PERFORMER: "hidden",
      STEADY: "hidden",
      NEEDS_REVIEW: "hidden",
      SENT: "hidden",
    },
  },
  defaultVariants: {
    variant: "success",
  },
});

type AuthStatusVariant = "success" | "warning" | "neutral";

interface AuthStatusBadgeProps extends VariantProps<
  typeof statusBadgeVariants
> {
  label: string;
  variant?: AuthStatusVariant;
  className?: string;
  status?: never;
}

interface OrderStatusBadgeProps {
  status: TableStatus;
  label?: string;
  className?: string;
  variant?: never;
  filterHref?: string;
  onFilterClick?: () => void;
}

type StatusBadgeProps = AuthStatusBadgeProps | OrderStatusBadgeProps;

export function StatusBadge(props: StatusBadgeProps) {
  if ("status" in props && props.status) {
    const { status, label, className, filterHref, onFilterClick } = props;
    const badge = (
      <span
        className={cn(
          statusBadgeVariants({ variant: status }),
          (filterHref || onFilterClick) &&
            "cursor-pointer transition-opacity hover:opacity-80",
          className,
        )}
      >
        {label ?? status}
      </span>
    );

    if (filterHref) {
      return (
        <a
          href={filterHref}
          onClick={(event) => {
            event.stopPropagation();
            onFilterClick?.();
          }}
          className="inline-flex"
        >
          {badge}
        </a>
      );
    }

    if (onFilterClick) {
      return (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onFilterClick();
          }}
          className="inline-flex"
        >
          {badge}
        </button>
      );
    }

    return badge;
  }

  const { label, variant = "success", className } = props;

  return (
    <div className={cn(statusBadgeVariants({ variant }), className)}>
      <span className={cn(dotVariants({ variant }))} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
