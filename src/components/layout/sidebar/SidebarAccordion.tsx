"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { SidebarItem } from "@/components/layout/sidebar/SidebarItem";
import type { NavItem } from "@/constants/navigation.constants";
import {
  findActiveChildItem,
  isPathActive,
} from "@/constants/navigation.constants";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarAccordionProps {
  item: NavItem;
  pathname: string;
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

export function SidebarAccordion({
  item,
  pathname,
  isCollapsed,
  isExpanded,
  onToggle,
  onNavigate,
}: SidebarAccordionProps) {
  const Icon = item.icon;
  const activeChild = item.children
    ? findActiveChildItem(item.children, pathname)
    : undefined;
  const isChildActive = Boolean(activeChild);
  const isParentRouteActive = isPathActive(pathname, item.href);
  const isInSection = isParentRouteActive || isChildActive;

  const triggerClassName = cn(
    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-120",
    "hover:cursor-pointer hover:bg-primary/10 hover:text-primary",
    "focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none",
    isInSection &&
      "border-l-4 border-primary bg-primary/10 pl-2.5 font-semibold text-primary",
    isCollapsed && "justify-center px-2",
  );

  const iconClassName = cn(
    "size-[18px] shrink-0 transition-colors duration-120",
    isInSection ? "text-primary" : "text-gray-400 group-hover:text-primary",
  );

  const trigger = (
    <button
      type="button"
      aria-expanded={isExpanded}
      aria-controls={`sidebar-accordion-${item.id}`}
      aria-label={`${item.label} menu`}
      className={triggerClassName}
      onClick={onToggle}
    >
      <Icon className={iconClassName} aria-hidden="true" />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform duration-200",
              isInSection ? "text-primary" : "text-gray-400",
              isExpanded && "rotate-180",
            )}
            aria-hidden="true"
          />
        </>
      )}
    </button>
  );

  return (
    <div>
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger render={trigger} />
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}

      <AnimatePresence initial={false}>
        {isExpanded && !isCollapsed && item.children ? (
          <motion.div
            id={`sidebar-accordion-${item.id}`}
            role="region"
            aria-label={`${item.label} submenu`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-1 flex flex-col gap-0.5 py-1 pl-3">
              {item.children.map((child) => (
                <SidebarItem
                  key={child.href}
                  item={child}
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                  isChild
                  showFavoriteToggle
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
