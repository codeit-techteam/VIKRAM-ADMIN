"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ConfirmationDialog } from "@/components/allocation/ConfirmationDialog";
import { FilterToolbar } from "@/components/shared/FilterToolbar";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { AddDeliveryPromotionDialog } from "@/features/cms/components/AddDeliveryPromotionDialog";
import { DeliveryPromotionHomePreview } from "@/features/cms/components/DeliveryPromotionHomePreview";
import { DeliveryPromotionTable } from "@/features/cms/components/DeliveryPromotionTable";
import {
  activateDeliveryPromotion,
  deactivateDeliveryPromotion,
  deleteDeliveryPromotion,
  getDeliveryPromotions,
} from "@/features/cms/services/delivery-promotion.api";
import {
  computeDeliveryPromotionLifecycle,
  computeDeliveryPromotionStats,
  type DeliveryPromotion,
  type DeliveryPromotionStatus,
} from "@/features/cms/types/delivery-promotion.types";
import { notify } from "@/utils/notify";

type StatKey = "total" | "active" | "scheduled" | "expired";

const STAT_STATUS: Record<StatKey, DeliveryPromotionStatus | "all"> = {
  total: "all",
  active: "ACTIVE",
  scheduled: "SCHEDULED",
  expired: "EXPIRED",
};

export function DeliveryPromotionPageContent() {
  const [promotions, setPromotions] = useState<DeliveryPromotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [rowCount, setRowCount] = useState("10");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPromotion, setEditPromotion] = useState<DeliveryPromotion | null>(
    null,
  );
  const [previewPromotion, setPreviewPromotion] =
    useState<DeliveryPromotion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeliveryPromotion | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await getDeliveryPromotions();
      setPromotions(rows);
    } catch (error) {
      notify.error(
        "Could not load promotions",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const stats = useMemo(
    () => computeDeliveryPromotionStats(promotions),
    [promotions],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return promotions.filter((row) => {
      const life = computeDeliveryPromotionLifecycle(row);
      if (status !== "all" && life !== status) return false;
      if (!query) return true;
      return (
        row.name.toLowerCase().includes(query) ||
        row.headline.toLowerCase().includes(query) ||
        (row.subtitle ?? "").toLowerCase().includes(query)
      );
    });
  }, [promotions, search, status]);

  const visible = filtered.slice(0, Number(rowCount) || 10);

  const handleStatClick = (key: StatKey) => {
    setStatus(STAT_STATUS[key]);
  };

  const handleToggle = async (row: DeliveryPromotion) => {
    const life = computeDeliveryPromotionLifecycle(row);
    try {
      if (life === "ACTIVE" || life === "SCHEDULED") {
        await deactivateDeliveryPromotion(row.id);
        notify.success("Promotion disabled", row.name);
      } else {
        await activateDeliveryPromotion(row.id);
        notify.success("Promotion enabled", row.name);
      }
      await refresh();
    } catch (error) {
      notify.error(
        "Update failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteDeliveryPromotion(deleteTarget.id);
      notify.success("Promotion deleted", deleteTarget.name);
      setDeleteTarget(null);
      await refresh();
    } catch (error) {
      notify.error(
        "Delete failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery Promotion Management"
        breadcrumbs={getNavBreadcrumbsFromPath(
          "/customer-app-cms/delivery-promotion",
        )}
        actions={
          <Button
            className="gap-2"
            onClick={() => {
              setEditPromotion(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Create Delivery Promotion
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Promotions"
          value={stats.total}
          isLoading={isLoading}
          isActive={status === "all"}
          onClick={() => handleStatClick("total")}
        />
        <StatCard
          label="Active"
          value={stats.active}
          isLoading={isLoading}
          isActive={status === "ACTIVE"}
          onClick={() => handleStatClick("active")}
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled}
          isLoading={isLoading}
          isActive={status === "SCHEDULED"}
          onClick={() => handleStatClick("scheduled")}
        />
        <StatCard
          label="Expired"
          value={stats.expired}
          isLoading={isLoading}
          isActive={status === "EXPIRED"}
          onClick={() => handleStatClick("expired")}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          rowCount={rowCount}
          onRowCountChange={setRowCount}
          statusOptions={[
            { value: "all", label: "All statuses" },
            { value: "ACTIVE", label: "Active" },
            { value: "SCHEDULED", label: "Scheduled" },
            { value: "DRAFT", label: "Draft" },
            { value: "EXPIRED", label: "Expired" },
            { value: "INACTIVE", label: "Inactive" },
          ]}
        />
        <div className="mt-4 overflow-x-auto">
          <DeliveryPromotionTable
            promotions={visible}
            onEdit={(row) => {
              setEditPromotion(row);
              setDialogOpen(true);
            }}
            onPreview={setPreviewPromotion}
            onToggle={handleToggle}
            onDelete={setDeleteTarget}
          />
        </div>
      </div>

      <AddDeliveryPromotionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editPromotion={editPromotion}
        onSaved={() => {
          setEditPromotion(null);
          void refresh();
        }}
      />

      <Dialog
        open={Boolean(previewPromotion)}
        onOpenChange={(open) => {
          if (!open) setPreviewPromotion(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preview on Customer App</DialogTitle>
          </DialogHeader>
          <DeliveryPromotionHomePreview promotion={previewPromotion} />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete delivery promotion?"
        message={
          deleteTarget
            ? `${deleteTarget.name} will be removed from Customer Home.`
            : undefined
        }
        confirmLabel="Delete"
        isSubmitting={isDeleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
