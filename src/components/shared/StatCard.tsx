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
  className,
}: StatCardProps) {
  const cardClassName = cn(
    "rounded-xl border border-gray-100 bg-white p-6 shadow-sm",
    href &&
      !isLoading &&
      "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md",
    className,
  );

  if (href && !isLoading) {
    return (
      <Link href={href} className={cn(cardClassName, "block")}>
        <StatCardContent
          label={label}
          value={value}
          subtext={subtext}
          valueVariant={valueVariant}
          icon={icon}
          iconContainerClassName={iconContainerClassName}
          iconClassName={iconClassName}
        />
      </Link>
    );
  }

  return (
    <div className={cardClassName}>
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
    </div>
  );
}

export function StatCardSkeleton() {
  return <StatCard label="" value="" isLoading />;
}
