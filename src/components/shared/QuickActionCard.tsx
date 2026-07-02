"use client";

import type { LucideIcon } from "lucide-react";
import { Send, ShoppingCart, Tag, Upload } from "lucide-react";

import { cn } from "@/lib/utils";

type QuickActionCircleColor = "orange" | "blue" | "indigo" | "green";

interface QuickActionCardProps {
  label: string;
  icon: LucideIcon;
  circleColor: QuickActionCircleColor;
  onClick?: () => void;
}

const circleColorClasses: Record<QuickActionCircleColor, string> = {
  orange: "bg-orange-50 text-primary",
  blue: "bg-blue-50 text-blue-600",
  indigo: "bg-indigo-50 text-indigo-600",
  green: "bg-green-50 text-green-600",
};

export function QuickActionCard({
  label,
  icon: Icon,
  circleColor,
  onClick,
}: QuickActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-colors hover:bg-gray-50"
    >
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          circleColorClasses[circleColor],
        )}
      >
        <Icon className="size-5" />
      </div>
      <span className="text-sm font-medium text-[#1A1A1A]">{label}</span>
    </button>
  );
}

const iconMap = {
  "shopping-cart": ShoppingCart,
  upload: Upload,
  send: Send,
  tag: Tag,
} as const;

interface QuickActionCardFromDataProps {
  label: string;
  iconName: keyof typeof iconMap;
  circleColor: QuickActionCircleColor;
  onClick?: () => void;
}

export function QuickActionCardFromData({
  label,
  iconName,
  circleColor,
  onClick,
}: QuickActionCardFromDataProps) {
  const Icon = iconMap[iconName];

  return (
    <QuickActionCard
      label={label}
      icon={Icon}
      circleColor={circleColor}
      onClick={onClick}
    />
  );
}
