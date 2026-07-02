"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ALL_NAV_ITEMS } from "@/constants/navigation.constants";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  return (
    <>
      <Button
        variant="outline"
        className="text-muted-foreground hidden h-9 w-64 justify-start gap-2 md:flex"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span>Search...</span>
        <kbd className="bg-muted ml-auto rounded px-1.5 py-0.5 text-xs">⌘K</kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-9 md:hidden"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="sr-only">Search</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Global Search">
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {ALL_NAV_ITEMS.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => handleSelect(item.href)}
              >
                <item.icon />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
