"use client";

import { format } from "date-fns";
import {
  History,
  IndianRupee,
  Pencil,
  Plus,
  RefreshCw,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/features/logistics/components/ConfirmDialog";
import {
  createDeliveryPricingRule,
  getDeliveryBenefitConfig,
  getDeliveryPricingHistory,
  getDeliveryPricingSummary,
  listDeliveryPricingRules,
  updateDeliveryBenefitConfig,
  updateDeliveryPricingRule,
  updateDeliveryPricingStatus,
} from "@/features/logistics/services/delivery-pricing.service";
import {
  DELIVERY_VEHICLE_OPTIONS,
  type DeliveryBenefitConfig,
  type DeliveryPricingHistoryEntry,
  type DeliveryPricingRule,
  type DeliveryPricingStatus,
  type DeliveryPricingSummary,
  type DeliveryVehicleType,
} from "@/features/logistics/types/delivery-pricing.types";
import { getApiErrorMessage } from "@/services/api";
import { formatCurrency } from "@/utils/format-currency";
import { notify } from "@/utils/notify";

type EditorMode = "create" | "edit";

interface EditorState {
  mode: EditorMode;
  rule?: DeliveryPricingRule;
  vehicleType: DeliveryVehicleType;
  distanceFromKm: string;
  distanceToKm: string;
  price: string;
  status: DeliveryPricingStatus;
  reason: string;
}

const EMPTY_EDITOR: EditorState = {
  mode: "create",
  vehicleType: "BIKE",
  distanceFromKm: "0",
  distanceToKm: "3",
  price: "100",
  status: "ACTIVE",
  reason: "",
};

function formatUpdatedAt(value?: string | null) {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

function formatHistoryAt(value: string) {
  try {
    return format(new Date(value), "d MMM yyyy, h:mm a");
  } catch {
    return value;
  }
}

export function DeliveryPricingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [summary, setSummary] = useState<DeliveryPricingSummary | null>(null);
  const [rules, setRules] = useState<DeliveryPricingRule[]>([]);
  const [benefit, setBenefit] = useState<DeliveryBenefitConfig | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<EditorState>(EMPTY_EDITOR);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRows, setHistoryRows] = useState<DeliveryPricingHistoryEntry[]>(
    [],
  );
  const [historyTitle, setHistoryTitle] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [benefitDraft, setBenefitDraft] = useState({
    firstBikeDeliveriesFree: "3",
    companyAbsorptionInr: "99",
    status: "ACTIVE" as DeliveryPricingStatus,
  });
  const [savingBenefit, setSavingBenefit] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [summaryData, rulesData, benefitData] = await Promise.all([
        getDeliveryPricingSummary(),
        listDeliveryPricingRules(),
        getDeliveryBenefitConfig(),
      ]);
      setSummary(summaryData);
      setRules(rulesData);
      setBenefit(benefitData);
      setBenefitDraft({
        firstBikeDeliveriesFree: String(benefitData.firstBikeDeliveriesFree),
        companyAbsorptionInr: String(benefitData.companyAbsorptionInr),
        status: benefitData.status,
      });
    } catch (error) {
      setIsError(true);
      notify.error(getApiErrorMessage(error, "Unable to load delivery pricing."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditor(EMPTY_EDITOR);
    setEditorOpen(true);
  };

  const openEdit = (rule: DeliveryPricingRule) => {
    setEditor({
      mode: "edit",
      rule,
      vehicleType: rule.vehicleType,
      distanceFromKm: String(rule.distanceFromKm),
      distanceToKm: String(rule.distanceToKm),
      price: String(rule.price),
      status: rule.status,
      reason: "Updated delivery pricing",
    });
    setEditorOpen(true);
  };

  const openHistory = async (rule: DeliveryPricingRule) => {
    setHistoryTitle(`${rule.vehicleDisplayName} · ${rule.distanceSlab}`);
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const rows = await getDeliveryPricingHistory(rule.id);
      setHistoryRows(rows);
    } catch (error) {
      notify.error(getApiErrorMessage(error, "Unable to load history."));
      setHistoryRows([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const pendingChangeLabel = useMemo(() => {
    if (editor.mode === "create") {
      return `Create ${editor.vehicleType.replaceAll("_", " ")} · ${editor.distanceFromKm}–${editor.distanceToKm} km at ₹${editor.price}`;
    }
    if (!editor.rule) return "";
    return `${editor.rule.vehicleDisplayName} · ${editor.rule.distanceSlab}\n₹${editor.rule.price} → ₹${editor.price}`;
  }, [editor]);

  const handleSaveClick = () => {
    const from = Number(editor.distanceFromKm);
    const to = Number(editor.distanceToKm);
    const price = Number(editor.price);
    if (Number.isNaN(from) || from < 0) {
      notify.error("Distance from must be >= 0");
      return;
    }
    if (Number.isNaN(to) || to <= from) {
      notify.error("Distance to must be greater than distance from");
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      notify.error("Delivery charge must be >= 0");
      return;
    }
    setConfirmOpen(true);
  };

  const persistEditor = async () => {
    setSaving(true);
    try {
      const payload = {
        distanceFromKm: Number(editor.distanceFromKm),
        distanceToKm: Number(editor.distanceToKm),
        price: Number(editor.price),
        status: editor.status,
        reason: editor.reason || undefined,
      };
      if (editor.mode === "create") {
        await createDeliveryPricingRule({
          ...payload,
          vehicleType: editor.vehicleType,
        });
        notify.success("Pricing rule created");
      } else if (editor.rule) {
        await updateDeliveryPricingRule(editor.rule.id, payload);
        notify.success("Pricing rule updated");
      }
      setEditorOpen(false);
      await loadData();
    } catch (error) {
      notify.error(getApiErrorMessage(error, "Unable to save pricing rule."));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (rule: DeliveryPricingRule) => {
    const next: DeliveryPricingStatus =
      rule.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateDeliveryPricingStatus(
        rule.id,
        next,
        next === "INACTIVE" ? "Deactivated pricing rule" : "Activated pricing rule",
      );
      notify.success(
        next === "ACTIVE" ? "Rule activated" : "Rule deactivated",
      );
      await loadData();
    } catch (error) {
      notify.error(getApiErrorMessage(error, "Unable to update status."));
    }
  };

  const saveBenefit = async () => {
    setSavingBenefit(true);
    try {
      const updated = await updateDeliveryBenefitConfig({
        firstBikeDeliveriesFree: Number(benefitDraft.firstBikeDeliveriesFree),
        companyAbsorptionInr: Number(benefitDraft.companyAbsorptionInr),
        status: benefitDraft.status,
      });
      setBenefit(updated);
      notify.success("Delivery benefits updated");
      await loadData();
    } catch (error) {
      notify.error(getApiErrorMessage(error, "Unable to update benefits."));
    } finally {
      setSavingBenefit(false);
    }
  };

  if (isError && !isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <EmptyState
          title="Unable to load delivery pricing"
          description="Check your connection and try again."
        />
        <Button onClick={() => void loadData()}>
          <RefreshCw className="mr-2 size-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Vehicles"
          value={summary?.activeVehicles ?? 0}
          icon={Truck}
          isLoading={isLoading}
        />
        <StatCard
          label="Active Pricing Rules"
          value={summary?.activePricingRules ?? 0}
          icon={IndianRupee}
          isLoading={isLoading}
        />
        <StatCard
          label="Free Bike Deliveries"
          value={summary?.freeBikeDeliveries ?? 0}
          subtext="Per customer (configurable)"
          isLoading={isLoading}
        />
        <StatCard
          label="Last Updated"
          value={formatUpdatedAt(summary?.lastUpdated)}
          isLoading={isLoading}
        />
      </div>

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#1A1A1A]">
              Customer Delivery Benefits
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Separate from Bike list price. Company absorption applies when free
              bike deliveries are used.
            </p>
          </div>
          <Button
            onClick={() => void saveBenefit()}
            disabled={savingBenefit || isLoading}
          >
            {savingBenefit ? "Saving…" : "Save Benefits"}
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>First Bike Deliveries Free</Label>
            <Input
              type="number"
              min={0}
              value={benefitDraft.firstBikeDeliveriesFree}
              onChange={(e) =>
                setBenefitDraft((s) => ({
                  ...s,
                  firstBikeDeliveriesFree: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Company Absorption (₹)</Label>
            <Input
              type="number"
              min={0}
              value={benefitDraft.companyAbsorptionInr}
              onChange={(e) =>
                setBenefitDraft((s) => ({
                  ...s,
                  companyAbsorptionInr: e.target.value,
                }))
              }
            />
            <p className="text-xs text-gray-400">
              Bike list price stays independent (currently seeded at ₹100).
            </p>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={benefitDraft.status}
              onValueChange={(v) =>
                setBenefitDraft((s) => ({
                  ...s,
                  status: v as DeliveryPricingStatus,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {benefit ? (
          <p className="mt-3 text-xs text-gray-400">
            Last updated {formatHistoryAt(benefit.updatedAt)}
            {benefit.updatedByName ? ` · ${benefit.updatedByName}` : ""}
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#1A1A1A]">
              Pricing Rules
            </h2>
            <p className="text-sm text-gray-500">
              Vehicle-wise distance slabs used by the Customer App and checkout.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void loadData()}>
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              Add Pricing Rule
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : rules.length === 0 ? (
          <div className="flex flex-col items-center gap-4 p-8">
            <EmptyState
              title="No pricing rules configured"
              description="Add vehicle and distance slabs to enable delivery pricing."
            />
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              Add Pricing Rule
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle Type</TableHead>
                <TableHead>Distance Slab</TableHead>
                <TableHead>Delivery Charge</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Updated By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">
                    {rule.vehicleDisplayName}
                  </TableCell>
                  <TableCell>{rule.distanceSlab}</TableCell>
                  <TableCell>{formatCurrency(rule.price)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        rule.status === "ACTIVE"
                          ? "bg-success/10 text-success"
                          : "bg-gray-100 text-gray-500"
                      }
                    >
                      {rule.status === "ACTIVE" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatUpdatedAt(rule.updatedAt)}</TableCell>
                  <TableCell className="text-gray-500">
                    {rule.updatedBy ? "Admin" : "System"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(rule)}
                      >
                        <Pencil className="mr-1 size-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void openHistory(rule)}
                      >
                        <History className="mr-1 size-3.5" />
                        History
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void toggleStatus(rule)}
                      >
                        {rule.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editor.mode === "create" ? "Add Pricing Rule" : "Edit Price"}
            </DialogTitle>
            <DialogDescription>
              Changes apply to new orders only. Historical orders keep their
              original delivery charge.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <Select
                value={editor.vehicleType}
                disabled={editor.mode === "edit"}
                onValueChange={(v) =>
                  setEditor((s) => ({
                    ...s,
                    vehicleType: v as DeliveryVehicleType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_VEHICLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Distance From (km)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={editor.distanceFromKm}
                  onChange={(e) =>
                    setEditor((s) => ({
                      ...s,
                      distanceFromKm: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Distance To (km)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={editor.distanceToKm}
                  onChange={(e) =>
                    setEditor((s) => ({
                      ...s,
                      distanceToKm: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Delivery Charge (₹)</Label>
              <Input
                type="number"
                min={0}
                value={editor.price}
                onChange={(e) =>
                  setEditor((s) => ({ ...s, price: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editor.status}
                onValueChange={(v) =>
                  setEditor((s) => ({
                    ...s,
                    status: v as DeliveryPricingStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input
                value={editor.reason}
                onChange={(e) =>
                  setEditor((s) => ({ ...s, reason: e.target.value }))
                }
                placeholder="Updated delivery pricing"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveClick} disabled={saving}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Update Delivery Charge?"
        description={`${pendingChangeLabel}\n\nThis change will apply to new orders only.`}
        confirmLabel="Confirm Update"
        onConfirm={() => void persistEditor()}
      />

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pricing History</DialogTitle>
            <DialogDescription>{historyTitle}</DialogDescription>
          </DialogHeader>
          {historyLoading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : historyRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No history yet.
            </p>
          ) : (
            <div className="max-h-80 space-y-3 overflow-y-auto py-2">
              {historyRows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-lg border border-gray-100 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {formatCurrency(row.previousPrice)} →{" "}
                      {formatCurrency(row.newPrice)}
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatHistoryAt(row.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {row.previousDistanceSlab} → {row.newDistanceSlab}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {row.updatedByName}
                    {row.reason ? ` · ${row.reason}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
