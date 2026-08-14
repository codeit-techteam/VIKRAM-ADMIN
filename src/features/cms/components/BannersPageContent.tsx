"use client";

import { Download, Filter, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ConfirmationDialog } from "@/components/allocation/ConfirmationDialog";
import { FilterToolbar } from "@/components/shared/FilterToolbar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { AddBannerDialog } from "@/features/cms/components/AddBannerDialog";
import { BannerMobilePreview } from "@/features/cms/components/BannerMobilePreview";
import { BannerModificationsTable } from "@/features/cms/components/BannerModificationsTable";
import { BannerPreviewTable } from "@/features/cms/components/BannerPreviewTable";
import {
  activateBanner,
  deactivateBanner,
  deleteBanner,
  duplicateBanner,
  getBannerModifications,
  getBanners,
  queryBannerModifications,
  queryBanners,
  reorderBanners,
} from "@/features/cms/services/banner.mock-api";
import type {
  Banner,
  BannerModification,
} from "@/features/cms/types/banner.types";
import { notify } from "@/utils/notify";

type ModificationFilters = {
  search: string;
  status: string;
};

const EMPTY_MOD_FILTERS: ModificationFilters = {
  search: "",
  status: "all",
};

function downloadModificationsCsv(rows: BannerModification[]) {
  const header = [
    "Banner",
    "Hub Targeting",
    "Status",
    "Clicks",
    "Last Updated By",
  ];

  const lines = rows.map((row) =>
    [row.name, row.hubTargeting, row.status, row.clicks, row.updatedBy]
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(","),
  );

  const blob = new Blob([[header.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `banner-modifications-${Date.now()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function BannersPageContent() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [modifications, setModifications] = useState<BannerModification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [rowCount, setRowCount] = useState("10");

  const [draftModFilters, setDraftModFilters] =
    useState<ModificationFilters>(EMPTY_MOD_FILTERS);
  const [appliedModFilters, setAppliedModFilters] =
    useState<ModificationFilters>(EMPTY_MOD_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const [nextBanners, nextMods] = await Promise.all([
      getBanners(),
      getBannerModifications(),
    ]);
    setBanners(nextBanners);
    setModifications(nextMods);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredBanners = useMemo(
    () =>
      queryBanners(banners, {
        search,
        status,
        pageSize: Number(rowCount) || 10,
      }),
    [banners, search, status, rowCount],
  );

  const filteredModifications = useMemo(
    () => queryBannerModifications(modifications, appliedModFilters),
    [modifications, appliedModFilters],
  );

  const liveCount = useMemo(
    () =>
      banners.filter(
        (banner) =>
          banner.status === "ACTIVE" || banner.status === "SCHEDULED",
      ).length,
    [banners],
  );

  const handleApplyModFilters = () => {
    setAppliedModFilters(draftModFilters);
    setFilterOpen(false);
    notify.success("Filters applied", "Banner modifications list updated.");
  };

  const handleResetModFilters = () => {
    setDraftModFilters(EMPTY_MOD_FILTERS);
    setAppliedModFilters(EMPTY_MOD_FILTERS);
    setFilterOpen(false);
  };

  const handleExportCsv = () => {
    downloadModificationsCsv(filteredModifications);
    notify.success(
      "Export started",
      `${filteredModifications.length} banner modification${filteredModifications.length === 1 ? "" : "s"} exported as CSV.`,
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteBanner(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
    notify.success("Banner deleted", `${deleteTarget.title} has been removed.`);
    await refresh();
  };

  const handleDuplicate = async (banner: Banner) => {
    try {
      await duplicateBanner(banner.id);
      notify.success("Banner duplicated", `${banner.title} copied as draft.`);
      await refresh();
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to duplicate banner",
      );
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    const isActive =
      banner.status === "ACTIVE" || banner.status === "SCHEDULED";
    try {
      if (isActive) {
        await deactivateBanner(banner.id);
        notify.success("Banner deactivated", `${banner.title} is hidden.`);
      } else {
        await activateBanner(banner.id);
        notify.success("Banner activated", `${banner.title} will appear in the app.`);
      }
      await refresh();
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to update banner",
      );
    }
  };

  const handleReorder = async (nextFiltered: Banner[]) => {
    const queue = [...nextFiltered];
    const filteredIds = new Set(nextFiltered.map((b) => b.id));
    const next = banners.map((banner) => {
      if (!filteredIds.has(banner.id)) return banner;
      return queue.shift() ?? banner;
    });

    const previous = banners;
    setBanners(next);
    setIsReordering(true);
    try {
      await reorderBanners(next);
      notify.success("Banner order updated", "Customer app will refresh.");
    } catch (error) {
      setBanners(previous);
      notify.error(
        error instanceof Error ? error.message : "Failed to reorder banners",
      );
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotional Banners"
        subtitle={`${liveCount} banner${liveCount === 1 ? "" : "s"} currently eligible to show on the Customer App Home Screen. Drag rows to change carousel order.`}
        breadcrumbs={getNavBreadcrumbsFromPath("/customer-app-cms/banners")}
        actions={
          <Button
            size="lg"
            className="h-10 gap-2 px-4"
            onClick={() => {
              setEditBanner(null);
              setAddDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add Banner
          </Button>
        }
      />

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <FilterToolbar
          className="mb-6"
          searchPlaceholder="Search title, placement, or CTA..."
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          statusOptions={[
            { value: "all", label: "All" },
            { value: "ACTIVE", label: "Active" },
            { value: "SCHEDULED", label: "Scheduled" },
            { value: "DRAFT", label: "Draft" },
            { value: "EXPIRED", label: "Expired" },
            { value: "INACTIVE", label: "Inactive" },
          ]}
          rowCount={rowCount}
          onRowCountChange={setRowCount}
        />
        <BannerPreviewTable
          banners={filteredBanners}
          isLoading={isLoading}
          isReordering={isReordering}
          onReorder={(next) => {
            void handleReorder(next);
          }}
          onEdit={(banner) => {
            setEditBanner(banner);
            setAddDialogOpen(true);
          }}
          onPreview={setPreviewBanner}
          onDuplicate={(banner) => {
            void handleDuplicate(banner);
          }}
          onToggleActive={(banner) => {
            void handleToggleActive(banner);
          }}
          onDelete={setDeleteTarget}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Recent Banner Modifications
          </h2>
          <div className="flex items-center gap-2">
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger
                render={
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="size-4" />
                    Filter
                  </Button>
                }
              />
              <PopoverContent align="end" className="w-80 gap-3 p-4">
                <PopoverHeader>
                  <PopoverTitle>Filter modifications</PopoverTitle>
                  <PopoverDescription>
                    Narrow by banner name, hub, or status.
                  </PopoverDescription>
                </PopoverHeader>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="mod-search">Search</Label>
                    <Input
                      id="mod-search"
                      placeholder="Banner, hub, or updater..."
                      value={draftModFilters.search}
                      onChange={(event) =>
                        setDraftModFilters((prev) => ({
                          ...prev,
                          search: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleApplyModFilters();
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select
                      value={draftModFilters.status}
                      onValueChange={(value: string) => {
                        if (value) {
                          setDraftModFilters((prev) => ({
                            ...prev,
                            status: value,
                          }));
                        }
                      }}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResetModFilters}
                    >
                      Reset
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApplyModFilters}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleExportCsv}
            >
              <Download className="size-4" />
              Export CSV
            </Button>
          </div>
        </div>
        <BannerModificationsTable
          modifications={filteredModifications}
          isLoading={isLoading}
        />
      </div>

      <AddBannerDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        editBanner={editBanner}
        onSaved={() => {
          void refresh();
        }}
      />

      <Dialog
        open={Boolean(previewBanner)}
        onOpenChange={(open) => {
          if (!open) setPreviewBanner(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customer App preview</DialogTitle>
          </DialogHeader>
          {previewBanner ? (
            <BannerMobilePreview
              variant={
                previewBanner.location === "HOME_HERO" ? "hero" : "promo"
              }
              title={previewBanner.title}
              subtitle={previewBanner.subtitle}
              badge={previewBanner.badge}
              ctaLabel={previewBanner.ctaLabel}
              backgroundColor={previewBanner.backgroundColor}
              ctaColor={previewBanner.ctaColor}
              imageUrl={
                previewBanner.mobileUrl ||
                previewBanner.imageUrl ||
                previewBanner.desktopUrl ||
                previewBanner.thumbnailUrl
              }
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete banner?"
        message={
          deleteTarget
            ? `Are you sure you want to delete “${deleteTarget.title}”? This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        isSubmitting={isDeleting}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
    </div>
  );
}
