import { cn } from "@/lib/utils";
import type { NotificationType } from "@/features/dashboard/types/dashboard.types";

interface NotificationItemProps {
  title: string;
  description: string;
  time: string;
  type: NotificationType;
  isUnread?: boolean;
  onClick?: () => void;
}

const dotColorClasses: Record<NotificationType, string> = {
  hub_created: "bg-primary",
  payment_received: "bg-green-500",
  customer_registered: "bg-blue-500",
  hub_accepted: "bg-blue-500",
  dispatch_started: "bg-green-500",
  low_stock: "bg-red-500",
};

export function NotificationItem({
  title,
  description,
  time,
  type,
  isUnread = false,
  onClick,
}: NotificationItemProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full gap-3 rounded-lg px-2 py-3 text-left transition-colors",
        onClick && "hover:bg-gray-50",
        isUnread && "bg-orange-50/40",
      )}
    >
      <div className="relative mt-1.5 shrink-0">
        <span
          className={cn("block size-2 rounded-full", dotColorClasses[type])}
          aria-hidden="true"
        />
        {isUnread ? (
          <span
            className="bg-primary absolute -top-0.5 -right-0.5 size-1.5 rounded-full ring-2 ring-white"
            aria-label="Unread"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#64748B]">
          {description}
        </p>
        <p className="mt-1 text-[11px] text-gray-400">{time}</p>
      </div>
    </Component>
  );
}
