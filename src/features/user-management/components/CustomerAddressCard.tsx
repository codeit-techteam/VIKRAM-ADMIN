"use client";

import { MapPin, Pencil, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CustomerDeliveryAddress } from "@/features/user-management/types/customer.types";
import { cn } from "@/lib/utils";

interface CustomerAddressCardProps {
  address: CustomerDeliveryAddress;
  onView: (address: CustomerDeliveryAddress) => void;
  onEdit: (address: CustomerDeliveryAddress) => void;
  onSetDefault: (addressId: string) => void;
  onDelete: (addressId: string) => void;
  className?: string;
}

export function CustomerAddressCard({
  address,
  onView,
  onEdit,
  onSetDefault,
  onDelete,
  className,
}: CustomerAddressCardProps) {
  return (
    <article
      className={cn(
        "hover:border-primary/20 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-colors",
        address.isDefault && "border-primary/20 ring-primary/10 ring-1",
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
              {address.recipient}
            </p>
            <p className="text-xs text-[#64748B]">{address.phone}</p>
          </div>
        </div>
        {address.isDefault ? (
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
            Default
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 space-y-2 text-sm text-[#64748B]">
        <p className="text-[#1A1A1A]">{address.address}</p>
        <p>
          {address.city}, {address.state} — {address.pincode}
        </p>
        <p>
          Service Hub:{" "}
          <span className="font-medium text-[#1A1A1A]">
            {address.serviceHubName}
          </span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => onView(address)}
        >
          View
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => onEdit(address)}
        >
          <Pencil className="size-3.5" />
          Edit
        </Button>
        {!address.isDefault ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => onSetDefault(address.id)}
          >
            <Star className="size-3.5" />
            Set Default
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => onDelete(address.id)}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>
    </article>
  );
}
