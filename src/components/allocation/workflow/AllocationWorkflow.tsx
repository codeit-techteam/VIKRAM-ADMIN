"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Info } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AllocationStepper } from "@/components/allocation/workflow/AllocationStepper";
import { AllocationSummary } from "@/components/allocation/workflow/AllocationSummary";
import { InventoryCard } from "@/components/allocation/workflow/InventoryCard";
import { RequisitionTable } from "@/components/allocation/workflow/RequisitionTable";
import {
  ReviewCard,
  ReviewSummaryPanel,
} from "@/components/allocation/workflow/ReviewCard";
import { SuccessPage } from "@/components/allocation/workflow/SuccessPage";
import { WarehouseTable } from "@/components/allocation/workflow/WarehouseTable";
import {
  buildSelectedRequisitionLabel,
  useWorkflowCancel,
  WorkflowStickyFooter,
} from "@/components/allocation/workflow/WorkflowStickyFooter";
import { WorkflowLoadingOverlay } from "@/components/allocation/workflow/WorkflowLoadingOverlay";
import {
  useAllocationFormValidation,
  WorkflowAllocationForm,
} from "@/components/allocation/workflow/WorkflowAllocationForm";
import { getStockAvailabilityLevel } from "@/mock/allocations";
import {
  formatWorkflowDate as formatWorkflowReqDate,
  getMaterialBatches,
} from "@/mock/allocation-workflow";
import {
  getWorkflowMaterialDetail,
  useAllocationWorkflowStore,
} from "@/store/allocation-workflow-store";
import { ROUTES } from "@/constants/routes";
import { notify } from "@/utils/notify";

const stepVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export function AllocationWorkflow() {
  const router = useRouter();
  const handleCancel = useWorkflowCancel();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const {
    currentStep,
    maxCompletedStep,
    isTransitioning,
    isSubmitting,
    requisitions,
    inventory,
    selectedRequisition,
    selectedWarehouse,
    warehouses,
    form,
    result,
    reset,
    selectRequisition,
    selectWarehouse,
    updateForm,
    saveDraft,
    goNext,
    goBack,
    confirmAllocation,
    hydrateWarehouses,
  } = useAllocationWorkflowStore();

  useEffect(() => {
    reset();
    const timer = window.setTimeout(() => setInitialLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, [reset]);

  const materialDetail = useMemo(
    () => getWorkflowMaterialDetail(selectedRequisition),
    [selectedRequisition],
  );

  const stockLevel = useMemo(() => {
    if (!selectedWarehouse || !selectedRequisition)
      return "out-of-stock" as const;
    return getStockAvailabilityLevel(
      selectedWarehouse.stock,
      selectedRequisition.requestedQty,
    );
  }, [selectedWarehouse, selectedRequisition]);

  const formValidation = useAllocationFormValidation(
    selectedRequisition ?? {
      id: "",
      requestId: "",
      requestedBy: { name: "", role: "" },
      hubName: "",
      hubId: "",
      warehouseId: "",
      warehouseName: "",
      materialId: "",
      material: "",
      requestedQty: 0,
      unit: "",
      priority: "low",
      status: "APPROVED",
      allocationStatus: "PENDING",
      createdAt: "",
      href: "",
    },
    form,
    inventory,
  );

  const selectedBatchLabel = useMemo(() => {
    if (!selectedRequisition || !form.batchId) return "";
    const batches = getMaterialBatches(
      selectedRequisition.materialId,
      form.warehouseSourceId,
      inventory,
    );
    return batches.find((batch) => batch.id === form.batchId)?.label ?? "";
  }, [selectedRequisition, form, inventory]);

  const handleRefreshWarehouses = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    hydrateWarehouses();
    setIsRefreshing(false);
    notify.success("Stock data refreshed");
  }, [hydrateWarehouses]);

  const handleConfirm = useCallback(async () => {
    try {
      await confirmAllocation();
      notify.success("Material allocated and inventory reserved.");
    } catch (error) {
      notify.error(
        "Allocation failed",
        error instanceof Error
          ? error.message
          : "Unable to confirm allocation.",
      );
    }
  }, [confirmAllocation]);

  const handleSuccessReset = useCallback(() => {
    reset();
    router.push(`${ROUTES.CENTRAL_WAREHOUSE}/allocate`);
  }, [reset, router]);

  const stepTitles: Record<number, { title: string; subtitle?: string }> = {
    1: {
      title: "Select Approved Requisition",
      subtitle: "Choose an approved requisition to begin material allocation.",
    },
    2: {
      title: "Inventory Availability",
      subtitle:
        "Confirm stock levels and source warehouse for the selected material requisition.",
    },
    3: {
      title: "Allocate Inventory",
      subtitle: "Step 3 of 4: Distribution Details",
    },
    4: {
      title: "Review Allocation",
      subtitle: "Verify allocation details before reserving inventory.",
    },
    5: {
      title: "Allocation Success",
    },
  };

  const canContinueStep1 = Boolean(selectedRequisition);
  const canContinueStep2 = Boolean(
    selectedWarehouse &&
    selectedWarehouse.status !== "EMPTY" &&
    selectedWarehouse.stock > 0,
  );
  const canContinueStep3 =
    formValidation.isValid && form.allocationQty > 0 && Boolean(form.batchId);

  const estimatedSubtotal = useMemo(() => {
    if (!selectedRequisition || currentStep < 2) return undefined;
    const unitPrice = 410;
    const qty =
      currentStep >= 3 ? form.allocationQty : selectedRequisition.requestedQty;
    const total = qty * unitPrice;
    return `₹ ${total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [selectedRequisition, form.allocationQty, currentStep]);

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] flex-col">
      {currentStep < 5 ? (
        <div className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">
                {stepTitles[currentStep].title}
              </h1>
              {stepTitles[currentStep].subtitle ? (
                <p className="mt-1 text-sm text-[#64748B]">
                  {stepTitles[currentStep].subtitle}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              {currentStep === 2 && selectedRequisition ? (
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-[#64748B]">
                  <Calendar className="size-4" />
                  Expected Date:{" "}
                  <span className="font-semibold text-[#1A1A1A]">
                    {formatWorkflowReqDate(selectedRequisition.createdAt)}
                  </span>
                </div>
              ) : null}
              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-sm font-medium text-[#64748B] transition-colors hover:text-[#1A1A1A]"
                >
                  ✕ Cancel Workflow
                </button>
              ) : null}
            </div>
          </div>

          <AllocationStepper
            currentStep={currentStep}
            maxCompletedStep={maxCompletedStep}
          />
        </div>
      ) : null}

      <div className="relative mt-6 flex-1">
        <WorkflowLoadingOverlay visible={isTransitioning || initialLoading} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {currentStep === 1 ? (
              <div className="space-y-5">
                <RequisitionTable
                  requisitions={requisitions}
                  selectedId={selectedRequisition?.id ?? null}
                  isLoading={initialLoading}
                  onSelect={selectRequisition}
                />

                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/80 p-4">
                  <Info className="mt-0.5 size-4 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      System Selection Helper
                    </p>
                    <p className="mt-1 text-sm text-blue-800">
                      Selecting a requisition will automatically pull inventory
                      levels for the next step.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 2 && selectedRequisition && materialDetail ? (
              <div className="grid gap-6 xl:grid-cols-2">
                <InventoryCard
                  material={materialDetail}
                  requisition={selectedRequisition}
                  availableQty={selectedWarehouse?.stock ?? 0}
                  stockLevel={stockLevel}
                />
                <WarehouseTable
                  warehouses={warehouses}
                  requisition={selectedRequisition}
                  selectedWarehouseId={selectedWarehouse?.id ?? null}
                  onSelect={selectWarehouse}
                  onRefresh={handleRefreshWarehouses}
                  isRefreshing={isRefreshing}
                />
              </div>
            ) : null}

            {currentStep === 3 && selectedRequisition && selectedWarehouse ? (
              <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                <WorkflowAllocationForm
                  requisition={selectedRequisition}
                  formValues={form}
                  inventory={inventory}
                  onChange={updateForm}
                />
                <AllocationSummary
                  requisition={selectedRequisition}
                  form={form}
                  warehouse={selectedWarehouse}
                />
              </div>
            ) : null}

            {currentStep === 4 &&
            selectedRequisition &&
            materialDetail &&
            selectedWarehouse ? (
              <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                <ReviewCard
                  requisition={selectedRequisition}
                  material={materialDetail}
                  warehouse={selectedWarehouse}
                  form={form}
                  batchLabel={selectedBatchLabel}
                />
                <ReviewSummaryPanel
                  requisition={selectedRequisition}
                  material={materialDetail}
                  form={form}
                  isSubmitting={isSubmitting}
                  onConfirm={handleConfirm}
                  onBack={() => void goBack()}
                />
              </div>
            ) : null}

            {currentStep === 5 && result ? (
              <SuccessPage result={result} onReset={handleSuccessReset} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <WorkflowStickyFooter
        currentStep={currentStep}
        selectedLabel={
          selectedRequisition
            ? buildSelectedRequisitionLabel(
                selectedRequisition.requestId,
                selectedRequisition.material,
                selectedRequisition.requestedQty,
                selectedRequisition.unit,
              )
            : undefined
        }
        continueLabel={
          currentStep === 1
            ? "Continue to Stock Sourcing"
            : currentStep === 2
              ? "Continue to Allocation"
              : currentStep === 3
                ? "Continue"
                : "Continue"
        }
        subtotal={currentStep === 2 ? estimatedSubtotal : undefined}
        canContinue={
          currentStep === 1
            ? canContinueStep1
            : currentStep === 2
              ? canContinueStep2
              : currentStep === 3
                ? canContinueStep3
                : false
        }
        showBack={currentStep > 1 && currentStep < 5}
        onBack={() => void goBack()}
        onSaveDraft={
          currentStep < 4
            ? () => {
                saveDraft();
                notify.success("Draft saved");
              }
            : undefined
        }
        onContinue={currentStep < 4 ? () => void goNext() : undefined}
        onCancel={currentStep === 1 ? handleCancel : undefined}
      />
    </div>
  );
}
