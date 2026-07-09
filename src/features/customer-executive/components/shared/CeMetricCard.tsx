"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import { StatCard } from "@/components/shared/StatCard";
import { cn } from "@/lib/utils";

interface CeMetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  iconContainerClassName?: string;
  iconClassName?: string;
  href?: string;
  isLoading?: boolean;
  className?: string;
  index?: number;
  valueVariant?: "default" | "warning";
}

export function CeMetricCard({
  index = 0,
  className,
  ...props
}: CeMetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn("h-full", className)}
    >
      <StatCard
        {...props}
        className="h-full transition-shadow hover:shadow-md"
      />
    </motion.div>
  );
}
