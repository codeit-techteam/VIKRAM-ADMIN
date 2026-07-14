import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  valueVariant?: "default" | "warning";
  icon?: LucideIcon;
  iconContainerClassName?: string;
  iconClassName?: string;
  href?: string;
  isLoading?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

function StatCardContent({
  label,
  value,
  subtext,
  valueVariant = "default",
  icon: Icon,
  iconContainerClassName,
  iconClassName,
  isLoading,
}: Omit<StatCardProps, "href" | "className">) {
  if (isLoading) {
    return (
      <>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-8 w-16" />
        <Skeleton className="mt-2 h-4 w-40" />
      </>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 text-3xl font-bold",
              valueVariant === "warning" ? "text-primary" : "text-[#1A1A1A]",
            )}
          >
            {value}
          </p>
          {subtext ? (
            <p className="mt-1 text-sm text-[#64748B]">{subtext}</p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              iconContainerClassName,
            )}
          >
            <Icon className={cn("size-5", iconClassName)} />
          </div>
        ) : null}
      </div>
    </>
  );
}

export function StatCard({
  label,
  value,
  subtext,
  valueVariant = "default",
  icon,
  iconContainerClassName,
  iconClassName,
  href,
  isLoading,
  isActive = false,
  onClick,
  className,
}: StatCardProps) {
  const cardClassName = cn(
    "rounded-xl border p-6 shadow-sm transition-all duration-200",
    isActive
      ? "border-primary bg-primary/5 ring-primary/20 ring-2"
      : "border-gray-100 bg-white",
    href &&
      !isLoading &&
      "cursor-pointer hover:-translate-y-0.5 hover:border-primary hover:shadow-md",
    onClick &&
      !isLoading &&
      "cursor-pointer hover:scale-[1.01] hover:shadow-md",
    className,
  );

  const content = (
    <StatCardContent
      label={label}
      value={value}
      subtext={subtext}
      valueVariant={valueVariant}
      icon={icon}
      iconContainerClassName={iconContainerClassName}
      iconClassName={iconClassName}
      isLoading={isLoading}
    />
  );

  if (href && !isLoading) {
    return (
      <Link href={href} className={cn(cardClassName, "block")}>
        {content}
      </Link>
    );
  }

  if (onClick && !isLoading) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isActive}
        aria-label={`Filter by ${label}`}
        className={cn(cardClassName, "h-full w-full text-left")}
      >
        {content}
      </button>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}

export function StatCardSkeleton() {
  return <StatCard label="" value="" isLoading />;
}
