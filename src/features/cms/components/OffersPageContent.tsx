"use client";

import {
  CalendarClock,
  CheckCircle2,
  Plus,
  Search,
  Smartphone,
  Tag,
  TimerOff,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ConfirmationDialog } from "@/components/allocation/ConfirmationDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard } from "@/components/shared/StatCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { OfferTable } from "@/features/cms/components/OfferTable";
import {
  OFFER_STATUS_OPTIONS,
  OFFER_TYPE_OPTIONS,
} from "@/features/cms/constants/offer.mock";
import {
  deleteOffer,
  duplicateOffer,
  getOffers,
  getOfferStats,
  publishOffer,
  queryOffers,
  unpublishOffer,
} from "@/features/cms/services/offer.mock-api";
import type {
  Offer,
  OfferListFilters,
  OfferStats,
  OfferStatus,
  OfferType,
} from "@/features/cms/types/offer.types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

type OfferStatKey = "total" | "active" | "scheduled" | "expired";

const STAT_STATUS_MAP: Record<OfferStatKey, OfferStatus | "all"> = {
  total: "all",
  active: "ACTIVE",
  scheduled: "SCHEDULED",
  expired: "EXPIRED",
};

const DEFAULT_FILTERS: OfferListFilters = {
  search: "",
  status: "all",
  offerType: "all",
  sortByPriority: "desc",
  page: 1,
  pageSize: PAGE_SIZE,
};

export function OffersPageContent() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<OfferStats>({
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
  });
  const [filters, setFilters] = useState<OfferListFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const [nextOffers, nextStats] = await Promise.all([
      getOffers(),
      getOfferStats(),
    ]);
    setOffers(nextOffers);
    setStats(nextStats);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const { rows, total } = useMemo(
    () => queryOffers(offers, filters),
    [offers, filters],
  );

  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

  const updateFilter = <K extends keyof OfferListFilters>(
    key: K,
    value: OfferListFilters[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? (value as number) : 1,
    }));
  };

  const handleStatCardClick = (statId: OfferStatKey) => {
    const nextStatus = STAT_STATUS_MAP[statId];
    setFilters((prev) => ({
      ...prev,
      status: prev.status === nextStatus ? "all" : nextStatus,
      page: 1,
    }));
  };

  const handlePublish = async (offer: Offer) => {
    await publishOffer(offer.id);
    await refresh();
  };

  const handleUnpublish = async (offer: Offer) => {
    await unpublishOffer(offer.id);
    await refresh();
  };

  const handleDuplicate = async (offer: Offer) => {
    await duplicateOffer(offer.id);
    await refresh();
  };

  const handleConfirmDelete = async () => {
    if (!offerToDelete) return;
    setIsDeleting(true);
    await deleteOffer(offerToDelete.id);
    setIsDeleting(false);
    setOfferToDelete(null);
    await refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offer Management"
        subtitle="Create and schedule promotional offers for the Bajriwala customer application."
        breadcrumbs={getNavBreadcrumbsFromPath("/customer-app-cms/offers")}
        actions={
          <>
            <Link
              href="/customer-app-cms/offers/customer-home"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-10 gap-2 px-4",
              )}
            >
              <Smartphone className="size-4" />
              Customer App Home
            </Link>
            <Link
              href="/customer-app-cms/offers/create"
              className={cn(buttonVariants({ size: "lg" }), "h-10 gap-2 px-4")}
            >
              <Plus className="size-4" />
              Create Offer
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Offers"
          value={isLoading ? "—" : stats.total}
          icon={Tag}
          iconContainerClassName="bg-orange-50"
          iconClassName="text-primary"
          isLoading={isLoading}
          isActive={filters.status === "all"}
          onClick={() => handleStatCardClick("total")}
        />
        <StatCard
          label="Active Offers"
          value={isLoading ? "—" : stats.active}
          icon={CheckCircle2}
          iconContainerClassName="bg-emerald-50"
          iconClassName="text-emerald-600"
          isLoading={isLoading}
          isActive={filters.status === "ACTIVE"}
          onClick={() => handleStatCardClick("active")}
        />
        <StatCard
          label="Scheduled Offers"
          value={isLoading ? "—" : stats.scheduled}
          icon={CalendarClock}
          iconContainerClassName="bg-amber-50"
          iconClassName="text-amber-600"
          isLoading={isLoading}
          isActive={filters.status === "SCHEDULED"}
          onClick={() => handleStatCardClick("scheduled")}
        />
        <StatCard
          label="Expired Offers"
          value={isLoading ? "—" : stats.expired}
          icon={TimerOff}
          iconContainerClassName="bg-red-50"
          iconClassName="text-red-600"
          isLoading={isLoading}
          isActive={filters.status === "EXPIRED"}
          onClick={() => handleStatCardClick("expired")}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Search offers..."
                className="h-9 border-gray-200 bg-white pl-9 text-sm placeholder:text-gray-400"
              />
            </div>

            <Select
              value={filters.status}
              onValueChange={(value) => {
                if (value) {
                  updateFilter("status", value as OfferStatus | "all");
                }
              }}
            >
              <SelectTrigger className="h-9 w-full border-gray-200 sm:w-[160px]">
                <span className="text-gray-500">Status:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OFFER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.offerType}
              onValueChange={(value) => {
                if (value) {
                  updateFilter("offerType", value as OfferType | "all");
                }
              }}
            >
              <SelectTrigger className="h-9 w-full border-gray-200 sm:w-[180px]">
                <span className="text-gray-500">Placement:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Placements</SelectItem>
                {OFFER_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.sortByPriority}
              onValueChange={(value) => {
                if (value === "asc" || value === "desc") {
                  updateFilter("sortByPriority", value);
                }
              }}
            >
              <SelectTrigger className="h-9 w-full border-gray-200 sm:w-[180px]">
                <span className="text-gray-500">Priority:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">High → Low</SelectItem>
                <SelectItem value="asc">Low → High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0"
            onClick={() => setFilters(DEFAULT_FILTERS)}
          >
            Reset Filters
          </Button>
        </div>

        <OfferTable
          offers={rows}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onDuplicate={handleDuplicate}
          onDelete={setOfferToDelete}
        />

        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          pageSize={filters.pageSize}
          totalItems={total}
          onPageChange={(page) => updateFilter("page", page)}
          itemLabel="offers"
          className="mt-4 px-0"
        />
      </div>

      <ConfirmationDialog
        open={Boolean(offerToDelete)}
        onOpenChange={(open) => {
          if (!open) setOfferToDelete(null);
        }}
        title="Delete this offer?"
        message={
          offerToDelete
            ? `"${offerToDelete.name}" will be permanently removed from the CMS. This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete Offer"
        isSubmitting={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
