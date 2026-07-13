"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SidebarItemVariant = "parent" | "child" | "logout";

interface SidebarItemSharedProps {
  label: string;
  icon?: LucideIcon;
  isActive?: boolean;
  isCollapsed?: boolean;
  badge?: number;
  endAdornment?: ReactNode;
  className?: string;
  title?: string;
  variant?: SidebarItemVariant;
}

interface SidebarItemLinkProps extends SidebarItemSharedProps {
  href: string;
  onClick?: never;
}

interface SidebarItemButtonProps extends SidebarItemSharedProps {
  href?: undefined;
  onClick?: () => void;
  "aria-expanded"?: boolean;
}

export type SidebarItemProps = SidebarItemLinkProps | SidebarItemButtonProps;

function getItemClassName({
  variant,
  isActive,
  isCollapsed,
  className,
}: {
  variant: SidebarItemVariant;
  isActive: boolean;
  isCollapsed: boolean;
  className?: string;
}) {
  if (variant === "child") {
    return cn(
      "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200",
      isActive
        ? "bg-primary font-medium text-white"
        : "font-normal text-[#1A1A1A] hover:bg-primary/10",
      className,
    );
  }

  return cn(
    "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
    isActive ? "bg-primary text-white" : "text-foreground hover:bg-primary/10",
    isCollapsed && "justify-center px-2",
    variant === "logout" && !isActive && "text-foreground",
    className,
  );
}

function getIconClassName({
  variant,
  isActive,
}: {
  variant: SidebarItemVariant;
  isActive: boolean;
}) {
  if (variant === "child") {
    return cn("size-4 shrink-0", isActive ? "text-white" : "text-gray-400");
  }

  return cn(
    "size-[18px] shrink-0",
    isActive
      ? "text-white"
      : variant === "logout"
        ? "text-red-500"
        : "text-gray-400 group-hover:text-gray-500",
  );
}

export function SidebarItem(props: SidebarItemProps) {
  const {
    label,
    icon: Icon,
    isActive = false,
    isCollapsed = false,
    badge,
    endAdornment,
    className,
    title,
    variant = "parent",
  } = props;

  const itemClassName = getItemClassName({
    variant,
    isActive,
    isCollapsed,
    className,
  });

  const content = (
    <>
      {Icon ? (
        <Icon className={getIconClassName({ variant, isActive })} />
      ) : null}

      {(!isCollapsed || variant === "child") && (
        <>
          <span className="min-w-0 flex-1 truncate leading-snug">{label}</span>

          <div className="flex shrink-0 items-center gap-2">
            {badge ? (
              <span
                className={cn(
                  "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive && variant === "child"
                    ? "bg-white/20 text-white"
                    : isActive
                      ? "bg-white/80 text-[#1A1A1A]"
                      : "bg-red-100 text-[#1A1A1A]",
                )}
              >
                {badge}
              </span>
            ) : null}
            {endAdornment}
          </div>
        </>
      )}
    </>
  );

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        title={title}
        aria-current={isActive ? "page" : undefined}
        className={itemClassName}
      >
        {content}
      </Link>
    );
  }

  const buttonProps = props as SidebarItemButtonProps;

  return (
    <button
      type="button"
      title={title}
      aria-expanded={buttonProps["aria-expanded"]}
      className={cn(itemClassName, "text-left")}
      onClick={buttonProps.onClick}
    >
      {content}
    </button>
  );
}
