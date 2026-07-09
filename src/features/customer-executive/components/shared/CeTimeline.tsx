"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  CreditCard,
  MessageSquareWarning,
  Package,
  UserPlus,
  Truck,
} from "lucide-react";

import { formatRelativeTime } from "@/features/customer-executive/mock/queries";
import type {
  CeActivity,
  ActivityType,
} from "@/features/customer-executive/types";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS: Record<ActivityType, typeof Package> = {
  CUSTOMER_REGISTERED: UserPlus,
  ORDER_CREATED: Package,
  PAYMENT_RECEIVED: CreditCard,
  COMPLAINT_RAISED: MessageSquareWarning,
  DELIVERY_COMPLETED: Truck,
  COMPLAINT_RESOLVED: CheckCircle2,
  PAYMENT_LINK_SENT: CreditCard,
  NOTE_ADDED: MessageSquareWarning,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  CUSTOMER_REGISTERED: "bg-blue-100 text-blue-600",
  ORDER_CREATED: "bg-orange-100 text-orange-600",
  PAYMENT_RECEIVED: "bg-green-100 text-green-600",
  COMPLAINT_RAISED: "bg-red-100 text-red-600",
  DELIVERY_COMPLETED: "bg-purple-100 text-purple-600",
  COMPLAINT_RESOLVED: "bg-emerald-100 text-emerald-600",
  PAYMENT_LINK_SENT: "bg-blue-100 text-blue-600",
  NOTE_ADDED: "bg-gray-100 text-gray-600",
};

interface CeTimelineProps {
  activities: CeActivity[];
  className?: string;
  maxItems?: number;
}

export function CeTimeline({
  activities,
  className,
  maxItems,
}: CeTimelineProps) {
  const items = maxItems ? activities.slice(0, maxItems) : activities;

  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[#64748B]">
        No activities yet
      </p>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {items.map((activity, index) => {
        const Icon = ACTIVITY_ICONS[activity.type];
        const isLast = index === items.length - 1;

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-3 pb-5"
          >
            {!isLast && (
              <div className="absolute top-8 left-4 h-[calc(100%-8px)] w-px bg-gray-200" />
            )}
            <div
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
                ACTIVITY_COLORS[activity.type],
              )}
            >
              <Icon className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {activity.title}
                </p>
                <span className="shrink-0 text-xs text-[#64748B]">
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#64748B]">
                {activity.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
