import { AlertTriangle } from "lucide-react";

import type { LowStockItem } from "@/features/dashboard/types/dashboard.types";
import { LowStockAlertRow } from "@/features/dashboard/components/LowStockAlertRow";

interface LowStockAlertCardProps {
  items: LowStockItem[];
}

export function LowStockAlertCard({ items }: LowStockAlertCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-5 text-red-500" />
        <h2 className="text-base font-semibold text-[#1A1A1A]">
          Low Stock Alerts
        </h2>
      </div>

      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <LowStockAlertRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
