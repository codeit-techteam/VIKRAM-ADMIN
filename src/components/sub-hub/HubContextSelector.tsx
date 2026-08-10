"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hubsService } from "@/services/hubs.service";
import { useSelectedHubStore } from "@/store/selected-hub-store";
import { cn } from "@/lib/utils";

interface HubContextSelectorProps {
  className?: string;
  allowAll?: boolean;
  allLabel?: string;
  paramKey?: "hubId" | "hub";
}

export function HubContextSelector({
  className,
  allowAll = false,
  allLabel = "All hubs",
  paramKey = "hubId",
}: HubContextSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedHubId = useSelectedHubStore((s) => s.selectedHubId);
  const selectedHubName = useSelectedHubStore((s) => s.selectedHubName);
  const setSelectedHub = useSelectedHubStore((s) => s.setSelectedHub);

  const hubsQuery = useQuery({
    queryKey: ["admin-hubs", "selector"],
    queryFn: () => hubsService.list({ page: 1, limit: 100 }),
    staleTime: 30_000,
  });

  const hubs = useMemo(() => hubsQuery.data?.data ?? [], [hubsQuery.data]);

  const queryHubId =
    searchParams.get("hubId") || searchParams.get("hub") || null;

  useEffect(() => {
    if (!queryHubId) return;
    const match = hubs.find((hub) => hub.id === queryHubId);
    if (match) {
      if (selectedHubId !== match.id) {
        setSelectedHub(match.id, match.name);
      }
      return;
    }
    if (hubs.length === 0) return;
    // Invalid hub id in URL — clear to avoid showing wrong hub data.
    if (selectedHubId === queryHubId) {
      setSelectedHub(null, null);
    }
  }, [queryHubId, hubs, selectedHubId, setSelectedHub]);

  useEffect(() => {
    if (allowAll || queryHubId || selectedHubId || hubs.length === 0) return;
    const preferred =
      hubs.find((h) => h.isActive && h.operationalStatus === "ENABLED") ??
      hubs[0];
    if (preferred) {
      setSelectedHub(preferred.id, preferred.name);
    }
  }, [allowAll, queryHubId, selectedHubId, hubs, setSelectedHub]);

  const value = allowAll
    ? (selectedHubId ?? "all")
    : (selectedHubId ?? undefined);

  const onChange = (next: string | null) => {
    const hubId = !next || next === "all" ? null : next;
    const match = hubs.find((hub) => hub.id === hubId);
    setSelectedHub(hubId, match?.name ?? null);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("hub");
    if (hubId) {
      params.set(paramKey, hubId);
    } else {
      params.delete("hubId");
      params.delete(paramKey);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className={cn("flex min-w-[220px] flex-col gap-1", className)}>
      <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
        Selected Hub
      </span>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={hubsQuery.isLoading}
      >
        <SelectTrigger className="h-10 w-full bg-white">
          <SelectValue
            placeholder={
              selectedHubName ||
              (hubsQuery.isLoading ? "Loading hubs…" : "Select hub")
            }
          />
        </SelectTrigger>
        <SelectContent>
          {allowAll ? (
            <SelectItem value="all">{allLabel}</SelectItem>
          ) : null}
          {hubs.map((hub) => (
            <SelectItem key={hub.id} value={hub.id}>
              {hub.name}
              {!hub.isActive ? " (Inactive)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
