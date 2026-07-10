import { Badge } from "@/components/ui/badge";
import type { NavBadge } from "@/constants/navigation.constants";
import { cn } from "@/lib/utils";

interface SidebarBadgeProps {
  badge: number | NavBadge;
  className?: string;
}

function getBadgeConfig(badge: number | NavBadge) {
  if (typeof badge === "number") {
    return {
      text: String(badge),
      variant: "default" as const,
    };
  }

  return {
    text: badge.text,
    variant: badge.variant ?? ("default" as const),
  };
}

const variantClasses = {
  default: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
  destructive: "bg-red-50 text-red-700 border-red-200",
};

export function SidebarBadge({ badge, className }: SidebarBadgeProps) {
  const config = getBadgeConfig(badge);

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 rounded-full px-2 text-[10px] font-semibold tracking-wide",
        variantClasses[config.variant],
        className,
      )}
    >
      {config.text}
    </Badge>
  );
}
