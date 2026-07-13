"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { SidebarItem } from "@/components/layout/SidebarItem";
import type { NavItem } from "@/constants/navigation.constants";
import { cn } from "@/lib/utils";

interface SidebarAccordionProps {
  item: NavItem;
  isExpanded: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function SidebarAccordion({
  item,
  isExpanded,
  isCollapsed,
  onToggle,
  children,
}: SidebarAccordionProps) {
  const Icon = item.icon;

  if (isCollapsed) {
    return (
      <SidebarItem
        href={item.href}
        label={item.label}
        icon={Icon}
        isCollapsed
        title={item.label}
      />
    );
  }

  return (
    <div>
      <SidebarItem
        label={item.label}
        icon={Icon}
        title={item.label}
        aria-expanded={isExpanded}
        onClick={onToggle}
        endAdornment={
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-gray-400 transition-transform duration-200",
              isExpanded && "rotate-180",
            )}
          />
        }
      />

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "mt-1.5 flex flex-col gap-3 pl-1 transition-opacity duration-200",
              isExpanded ? "opacity-100" : "opacity-0",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
