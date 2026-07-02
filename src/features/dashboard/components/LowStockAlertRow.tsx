import Image from "next/image";

import { Button } from "@/components/ui/button";
import type { LowStockItem } from "@/features/dashboard/types/dashboard.types";

interface LowStockAlertRowProps {
  item: LowStockItem;
}

export function LowStockAlertRow({ item }: LowStockAlertRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={item.thumbnailUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#1A1A1A]">
          {item.name}
        </p>
        <p className="text-sm font-medium text-red-500">
          {item.stockLeftLabel}
        </p>
      </div>
      <Button
        size="sm"
        className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90"
      >
        Reorder
      </Button>
    </div>
  );
}
