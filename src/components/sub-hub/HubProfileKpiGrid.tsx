"use client";

import {
  ArrowLeftRight,
  ClipboardList,
  Package,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

import { Skeleton } from "@/components/ui/skeleton";
import type { HubProfileKpiCards } from "@/utils/hub-profile-metrics";
import { cn } from "@/lib/utils";

interface HubProfileKpiGridProps {
  kpis: HubProfileKpiCards;
  isLoading?: boolean;
}

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export function HubProfileKpiGrid({ kpis, isLoading }: HubProfileKpiGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={`kpi-skel-${index}`}
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-3 h-8 w-24" />
            <Skeleton className="mt-3 h-4 w-36" />
          </div>
        ))}
      </div>
    );
  }

  const cards: {
    id: string;
    label: string;
    value: string;
    subtitle: string;
    icon: LucideIcon;
    valueClass?: string;
  }[] = [
    {
      id: "inventory-value",
      label: "Inventory Value",
      value: kpis.inventoryValueLabel,
      subtitle: "Available Qty × Unit Price",
      icon: Package,
    },
    {
      id: "orders-pending",
      label: "Orders Pending",
      value: String(kpis.customerOrdersPending),
      subtitle: "Open customer orders",
      icon: ShoppingCart,
      valueClass:
        kpis.customerOrdersPending > 0 ? "text-orange-500" : "text-[#1A1A1A]",
    },
    {
      id: "requisitions-pending",
      label: "Pending Requisitions",
      value: String(kpis.pendingRequisitions),
      subtitle: "Awaiting warehouse action",
      icon: ClipboardList,
      valueClass:
        kpis.pendingRequisitions > 0 ? "text-orange-500" : "text-[#1A1A1A]",
    },
    {
      id: "incoming-transfers",
      label: "Incoming Transfers",
      value: String(kpis.incomingTransfers),
      subtitle: "In transit to this hub",
      icon: ArrowLeftRight,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            {...fadeUp}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
                  {card.label}
                </p>
                <p
                  className={cn(
                    "mt-2 text-3xl font-bold tabular-nums",
                    card.valueClass ?? "text-[#1A1A1A]",
                  )}
                >
                  {card.value}
                </p>
                <p className="mt-1 text-sm text-[#64748B]">{card.subtitle}</p>
              </div>
              <div className="bg-primary/10 text-primary group-hover:bg-primary/15 flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                <Icon className="size-5" strokeWidth={1.75} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
