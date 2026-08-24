"use client";

import { MapPin, Pencil, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DELIVERY_SITE_TYPE_LABELS,
  type DeliverySite,
} from "@/features/user-management/types/customer.types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format-date";

interface CustomerAddressCardProps {
  site: DeliverySite;
  onView: (site: DeliverySite) => void;
  onEdit: (site: DeliverySite) => void;
  onSetPrimary: (siteId: string) => void;
  onDelete: (siteId: string) => void;
  className?: string;
}

function formatCoords(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

export function CustomerAddressCard({
  site,
  onView,
  onEdit,
  onSetPrimary,
  onDelete,
  className,
}: CustomerAddressCardProps) {
  const siteTypeLabel = site.siteType
    ? DELIVERY_SITE_TYPE_LABELS[site.siteType]
    : null;

  return (
    <article
      className={cn(
        "hover:border-primary/20 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-colors",
        site.isPrimary && "border-primary/20 ring-primary/10 ring-1",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 flex size-9 items-center justify-center rounded-lg">
            <MapPin className="text-primary size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">
              {site.siteName}
            </p>
            {siteTypeLabel ? (
              <p className="text-xs text-[#64748B]">{siteTypeLabel}</p>
            ) : null}
          </div>
        </div>
        {site.isPrimary ? (
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
            Primary
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 space-y-2 text-sm text-[#64748B]">
        <p className="text-[#1A1A1A]">{site.fullAddress}</p>
        <p>
          {site.city}, {site.state}
          {site.pincode ? ` — ${site.pincode}` : ""}
        </p>
        <p>
          Coords:{" "}
          <span className="font-medium text-[#1A1A1A]">
            {formatCoords(site.latitude, site.longitude)}
          </span>
        </p>
        <p>
          Created:{" "}
          <span className="font-medium text-[#1A1A1A]">
            {formatDate(site.createdAt)}
          </span>
        </p>
        {typeof site.ordersDelivered === "number" ? (
          <p>
            Orders delivered:{" "}
            <span className="font-medium text-[#1A1A1A]">
              {site.ordersDelivered}
            </span>
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => onView(site)}
        >
          View
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => onEdit(site)}
        >
          <Pencil className="size-3.5" />
          Edit
        </Button>
        {!site.isPrimary ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => onSetPrimary(site.id)}
          >
            <Star className="size-3.5" />
            Set Primary
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => onDelete(site.id)}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>
    </article>
  );
}
