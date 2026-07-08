"use client";

import {
  CheckCircle2,
  PackageCheck,
  Truck,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import type {
  HubLiveOpsCounts,
  HubOpsStageFilter,
} from "@/utils/hub-profile-metrics";
import { getOpsStageHref } from "@/utils/hub-profile-metrics";
import { cn } from "@/lib/utils";

interface HubLiveOpsPanelProps {
  hubId: string;
  counts: HubLiveOpsCounts;
  activeStage?: HubOpsStageFilter | null;
  onSelectStage?: (stage: HubOpsStageFilter) => void;
}

const STAGES: {
  id: HubOpsStageFilter;
  label: string;
  icon: LucideIcon;
  countKey: keyof HubLiveOpsCounts;
  tone: string;
}[] = [
  {
    id: "incoming",
    label: "Incoming Transfers",
    icon: Warehouse,
    countKey: "incoming",
    tone: "border-blue-100 hover:border-blue-200 hover:bg-blue-50/50",
  },
  {
    id: "loading",
    label: "Loading",
    icon: PackageCheck,
    countKey: "loading",
    tone: "border-orange-100 hover:border-orange-200 hover:bg-orange-50/50",
  },
  {
    id: "ready",
    label: "Ready To Dispatch",
    icon: CheckCircle2,
    countKey: "ready",
    tone: "border-amber-100 hover:border-amber-200 hover:bg-amber-50/50",
  },
  {
    id: "in-transit",
    label: "In Transit",
    icon: Truck,
    countKey: "inTransit",
    tone: "border-primary/20 hover:border-primary/40 hover:bg-orange-50/50",
  },
  {
    id: "delivered-today",
    label: "Delivered Today",
    icon: CheckCircle2,
    countKey: "deliveredToday",
    tone: "border-green-100 hover:border-green-200 hover:bg-green-50/50",
  },
];

export function HubLiveOpsPanel({
  hubId,
  counts,
  activeStage,
  onSelectStage,
}: HubLiveOpsPanelProps) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-[#1A1A1A]">
        Live Operations
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const count = counts[stage.countKey];
          const isActive = activeStage === stage.id;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
            >
              <Link
                href={getOpsStageHref(hubId, stage.id)}
                onClick={(event) => {
                  if (onSelectStage) {
                    event.preventDefault();
                    onSelectStage(stage.id);
                  }
                }}
                className={cn(
                  "flex h-full flex-col rounded-xl border p-4 transition-all duration-200",
                  stage.tone,
                  isActive && "ring-primary/40 bg-orange-50/60 ring-2",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <Icon className="size-4 text-[#64748B]" strokeWidth={1.75} />
                  <span
                    className={cn(
                      "inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                      count > 0
                        ? "bg-primary/15 text-primary"
                        : "bg-gray-100 text-gray-500",
                    )}
                  >
                    {count}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-[#1A1A1A]">
                  {stage.label}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
