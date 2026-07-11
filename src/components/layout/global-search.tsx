"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Network,
  Package,
  Search,
  Truck,
  UserCog,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ALL_NAV_ITEMS } from "@/constants/navigation.constants";
import { ROUTES } from "@/constants/routes";
import {
  GLOBAL_SEARCH_TYPE_LABELS,
  searchGlobalEntitiesWithFleet,
  type GlobalSearchEntityType,
} from "@/mock/global-search-index";
import { cn } from "@/lib/utils";

interface EnterpriseGlobalSearchProps {
  variant?: "topbar" | "button";
  placeholder?: string;
  className?: string;
}

interface QuickAccessItem {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const QUICK_ACCESS: QuickAccessItem[] = [
  {
    label: "Dashboard",
    description: "Executive overview",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    description: "Active procurement orders",
    href: ROUTES.ORDERS,
    icon: ClipboardList,
  },
  {
    label: "Finance & Payments",
    description: "Invoices and settlements",
    href: ROUTES.FINANCE_PAYMENTS,
    icon: Wallet,
  },
  {
    label: "Logistics",
    description: "Fleet and deliveries",
    href: ROUTES.LOGISTICS,
    icon: Truck,
  },
  {
    label: "Central Warehouse",
    description: "Inventory and transfers",
    href: ROUTES.CENTRAL_WAREHOUSE,
    icon: Warehouse,
  },
  {
    label: "Sub-Hub Network",
    description: "Hubs and dispatch logs",
    href: ROUTES.SUB_HUB_NETWORK,
    icon: Network,
  },
  {
    label: "Customer Executive",
    description: "Customers and follow-ups",
    href: ROUTES.CUSTOMER_EXECUTIVE,
    icon: UserCog,
  },
  {
    label: "User Management",
    description: "Teams and roles",
    href: ROUTES.USER_MANAGEMENT,
    icon: Users,
  },
];

const ENTITY_ICONS: Record<GlobalSearchEntityType, LucideIcon> = {
  order: ClipboardList,
  customer: Users,
  warehouse: Warehouse,
  hub: Building2,
  driver: Truck,
  vehicle: Truck,
  executive: UserCog,
  page: Package,
};

function dedupeByHref<T extends { href: string; label: string }>(
  items: T[],
): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.href;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function EnterpriseGlobalSearch({
  variant = "topbar",
  placeholder = "Search orders, hubs, customers...",
  className,
}: EnterpriseGlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  const entityResults = useMemo(
    () => (hasQuery ? searchGlobalEntitiesWithFleet(trimmedQuery, 12) : []),
    [hasQuery, trimmedQuery],
  );

  const groupedResults = useMemo(() => {
    const groups = new Map<GlobalSearchEntityType, typeof entityResults>();

    for (const result of entityResults) {
      const existing = groups.get(result.type) ?? [];
      existing.push(result);
      groups.set(result.type, existing);
    }

    return groups;
  }, [entityResults]);

  const navResults = useMemo(() => {
    if (!hasQuery) return [];

    const q = trimmedQuery.toLowerCase();
    const matches = ALL_NAV_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q),
    );

    return dedupeByHref(matches).slice(0, 8);
  }, [hasQuery, trimmedQuery]);

  const hasResults = groupedResults.size > 0 || navResults.length > 0;

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setQuery("");
    }
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      handleOpenChange(false);
      router.push(href);
    },
    [handleOpenChange, router],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        handleOpenChange(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleOpenChange]);

  return (
    <>
      {variant === "topbar" ? (
        <button
          type="button"
          onClick={() => handleOpenChange(true)}
          className={cn(
            "relative flex h-11 w-full items-center rounded-full border border-transparent bg-[#EEF4FF] pr-4 pl-10 text-left text-sm text-gray-400 transition-colors hover:bg-[#E3ECFF]",
            className,
          )}
        >
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400" />
          <span className="truncate">{placeholder}</span>
          <kbd className="ml-auto hidden rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-gray-400 sm:inline">
            ⌘K
          </kbd>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => handleOpenChange(true)}
          className={cn(
            "text-muted-foreground flex h-9 items-center gap-2 rounded-md border px-3 text-sm",
            className,
          )}
        >
          <Search className="size-4" />
          Search...
        </button>
      )}

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Global Search"
        description="Search orders, customers, hubs, and pages across Bajriwala"
        className="sm:max-w-xl"
        showCloseButton
      >
        <div className="border-b border-gray-100">
          <CommandInput
            placeholder="Type to search orders, customers, hubs..."
            value={query}
            onValueChange={setQuery}
            className="h-11 text-base"
          />
        </div>

        <CommandList className="max-h-[min(420px,60vh)] px-1 pb-2">
          {hasQuery && !hasResults ? (
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-2">
                <Search className="size-8 text-gray-300" />
                <p className="font-medium text-[#1A1A1A]">No results found</p>
                <p className="max-w-[240px] text-xs text-[#64748B]">
                  Try an order ID, customer name, hub, or page name.
                </p>
              </div>
            </CommandEmpty>
          ) : null}

          {!hasQuery ? (
            <CommandGroup heading="Quick Access">
              {QUICK_ACCESS.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.href}
                    value={`${item.label} ${item.description}`}
                    onSelect={() => handleSelect(item.href)}
                    className="gap-3 px-3 py-2.5"
                  >
                    <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
                      <Icon className="text-primary size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1A1A1A]">
                        {item.label}
                      </p>
                      <p className="truncate text-xs text-[#64748B]">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="size-3.5 shrink-0 text-gray-300" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : null}

          {Array.from(groupedResults.entries()).map(([type, items]) => {
            const TypeIcon = ENTITY_ICONS[type];
            return (
              <CommandGroup
                key={type}
                heading={GLOBAL_SEARCH_TYPE_LABELS[type]}
              >
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${item.subtitle}`}
                    onSelect={() => handleSelect(item.href)}
                    className="gap-3 px-3 py-2.5"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <TypeIcon className="size-4 text-[#64748B]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1A1A1A]">
                        {item.label}
                      </p>
                      <p className="truncate text-xs text-[#64748B]">
                        {item.subtitle}
                      </p>
                    </div>
                    <ArrowRight className="size-3.5 shrink-0 text-gray-300" />
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}

          {navResults.length > 0 ? (
            <>
              {groupedResults.size > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading="Pages">
                {navResults.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={`${item.href}-${item.label}`}
                      value={item.label}
                      onSelect={() => handleSelect(item.href)}
                      className="gap-3 px-3 py-2.5"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <Icon className="size-4 text-[#64748B]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#1A1A1A]">
                          {item.label}
                        </p>
                        <p className="truncate text-xs text-[#64748B]">
                          Go to page
                        </p>
                      </div>
                      <ArrowRight className="size-3.5 shrink-0 text-gray-300" />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          ) : null}
        </CommandList>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5 text-[11px] text-[#94A3B8]">
          <span>Search across Bajriwala modules</span>
          <span className="hidden sm:inline">
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-sans">
              Esc
            </kbd>{" "}
            to close
          </span>
        </div>
      </CommandDialog>
    </>
  );
}

/** @deprecated Use EnterpriseGlobalSearch */
export function GlobalSearch() {
  return <EnterpriseGlobalSearch variant="button" />;
}
