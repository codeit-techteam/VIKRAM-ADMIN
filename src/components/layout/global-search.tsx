"use client";

import { Search } from "lucide-react";
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

export function EnterpriseGlobalSearch({
  variant = "topbar",
  placeholder = "Search orders, hubs, customers...",
  className,
}: EnterpriseGlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const entityResults = useMemo(
    () => searchGlobalEntitiesWithFleet(query, 12),
    [query],
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
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_NAV_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q),
    ).slice(0, 6);
  }, [query]);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      {variant === "topbar" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
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
          onClick={() => setOpen(true)}
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
        onOpenChange={setOpen}
        title="Global Search"
        description="Search orders, customers, warehouses, hubs, drivers, vehicles, and executives"
      >
        <CommandInput
          placeholder="Search orders, customers, hubs, drivers..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {Array.from(groupedResults.entries()).map(([type, items]) => (
            <CommandGroup key={type} heading={GLOBAL_SEARCH_TYPE_LABELS[type]}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.subtitle}`}
                  onSelect={() => handleSelect(item.href)}
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{item.label}</span>
                    <span className="truncate text-xs text-gray-500">
                      {item.subtitle}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          {navResults.length > 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="Pages">
                {navResults.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={item.label}
                    onSelect={() => handleSelect(item.href)}
                  >
                    <item.icon className="mr-2 size-4" />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}

/** @deprecated Use EnterpriseGlobalSearch */
export function GlobalSearch() {
  return <EnterpriseGlobalSearch variant="button" />;
}
