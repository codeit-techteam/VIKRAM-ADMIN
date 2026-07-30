"use client";

import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  IndianRupee,
  Repeat,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { HubOrderAnalytics } from "@/types/hub-orders.types";
import { formatCurrency } from "@/utils/format-currency";

interface HubOrderAnalyticsSectionProps {
  analytics: HubOrderAnalytics | undefined;
  isLoading?: boolean;
}

function AnalyticsCard({
  label,
  value,
  subtext,
  icon: Icon,
  index,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: typeof BarChart3;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
            {label}
          </p>
          <p className="mt-2 text-xl font-bold text-[#1A1A1A] tabular-nums">
            {value}
          </p>
          {subtext ? (
            <p className="mt-1 text-xs text-[#64748B]">{subtext}</p>
          ) : null}
        </div>
        <Icon className="text-primary size-4 shrink-0" strokeWidth={1.75} />
      </div>
    </motion.div>
  );
}

export function HubOrderAnalyticsSection({
  analytics,
  isLoading,
}: HubOrderAnalyticsSectionProps) {
  if (isLoading) {
    return (
      <DashboardCard
        title="Hub Order Analytics"
        titleIcon={<BarChart3 className="text-primary size-4" />}
      >
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </DashboardCard>
    );
  }

  const items = [
    {
      label: "Today's Orders",
      value: String(analytics?.todaysOrders ?? 0),
      icon: CalendarDays,
    },
    {
      label: "This Week",
      value: String(analytics?.thisWeek ?? 0),
      icon: CalendarRange,
    },
    {
      label: "This Month",
      value: String(analytics?.thisMonth ?? 0),
      icon: TrendingUp,
    },
    {
      label: "Average Order Value",
      value: formatCurrency(analytics?.averageOrderValue ?? 0),
      icon: IndianRupee,
    },
    {
      label: "Highest Selling Category",
      value: analytics?.highestSellingCategory ?? "—",
      subtext: analytics?.highestSellingCategoryQty
        ? `${analytics.highestSellingCategoryQty} units sold`
        : undefined,
      icon: Star,
    },
    {
      label: "Highest Selling Product",
      value: analytics?.highestSellingProduct ?? "—",
      subtext: analytics?.highestSellingProductQty
        ? `${analytics.highestSellingProductQty} units sold`
        : undefined,
      icon: Star,
    },
    {
      label: "Repeat Customers",
      value: String(analytics?.repeatCustomers ?? 0),
      subtext: analytics?.totalCustomers
        ? `of ${analytics.totalCustomers} total`
        : undefined,
      icon: Repeat,
    },
    {
      label: "Pending COD Collection",
      value: formatCurrency(analytics?.pendingCodCollection ?? 0),
      subtext: analytics?.pendingCodOrders
        ? `${analytics.pendingCodOrders} orders`
        : undefined,
      icon: Wallet,
    },
  ];

  return (
    <DashboardCard
      title="Hub Order Analytics"
      titleIcon={<BarChart3 className="text-primary size-4" />}
    >
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => (
          <AnalyticsCard key={item.label} {...item} index={index} />
        ))}
      </div>
    </DashboardCard>
  );
}
