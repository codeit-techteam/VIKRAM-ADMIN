"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { TransferDetailsStep } from "@/components/transfers/workflow/TransferDetailsStep";
import { DriverAssignmentStep } from "@/components/transfers/workflow/DriverAssignmentStep";
import { TransferReviewStep } from "@/components/transfers/workflow/TransferReviewStep";
import { TransferStepper } from "@/components/transfers/workflow/TransferStepper";
import { TransferSuccessPage } from "@/components/transfers/workflow/TransferSuccessPage";
import { TransferWorkflowFooter } from "@/components/transfers/workflow/TransferWorkflowFooter";
import { VehicleAssignmentStep } from "@/components/transfers/workflow/VehicleAssignmentStep";
import { WorkflowLoadingOverlay } from "@/components/allocation/workflow/WorkflowLoadingOverlay";
import { ROUTES } from "@/constants/routes";
import { useTransferWorkflowStore } from "@/store/transfer-workflow-store";
import {
  mapAllocationToTransferContext,
  readAllocationForTransfer,
} from "@/utils/allocation-transfer-bridge";
import { notify } from "@/utils/notify";

const stepVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

const stepTitles: Record<number, { title: string; subtitle?: string }> = {
  1: {
    title: "Create Transfer",
    subtitle: "Step 1: Transfer Details",
  },
  2: {
    title: "Create Transfer Wizard",
    subtitle: "Step 2: Assign Vehicle",
  },
  3: {
    title: "Create Transfer Wizard",
    subtitle: "Step 3: Assign Driver",
  },
  4: {
    title: "Dispatch Review",
    subtitle: "Step 4: Review and confirm transfer details",
  },
  5: {
    title: "Transfer Created",
  },
};

export function TransferWorkflow() {
  const router = useRouter();
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const {
    currentStep,
    maxCompletedStep,
    isTransitioning,
    isSubmitting,
    transferId,
    context,
    form,
    result,
    vehicles,
    drivers,
    reset,
    initializeFromContext,
    updateForm,
    saveDraft,
    goNext,
    goBack,
    confirmTransfer,
  } = useTransferWorkflowStore();

  useEffect(() => {
    const allocationResult = readAllocationForTransfer();

    if (!allocationResult) {
      notify.error(
        "Allocation required",
        "Create Transfer is only available after a successful material allocation.",
      );
      router.replace(`${ROUTES.CENTRAL_WAREHOUSE}/transfers`);
      return;
    }

    if (!initialized) {
      const transferContext = mapAllocationToTransferContext(allocationResult);
      initializeFromContext(transferContext);
      setInitialized(true);
    }

    const timer = window.setTimeout(() => setInitialLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, [initializeFromContext, initialized, router]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === form.vehicleId),
    [vehicles, form.vehicleId],
  );

  const canContinueStep1 =
    Boolean(form.dispatchDate) &&
    Boolean(form.expectedArrival) &&
    Boolean(form.transferType);

  const canContinueStep2 =
    Boolean(form.vehicleId) &&
    Boolean(selectedVehicle) &&
    (selectedVehicle?.capacityKg ?? 0) >= (context?.estimatedWeightKg ?? 0);

  const canContinueStep3 = Boolean(form.driverId);

  const handleCancel = useCallback(() => {
    reset();
    router.push(`${ROUTES.CENTRAL_WAREHOUSE}/transfers`);
  }, [reset, router]);

  const handleConfirm = useCallback(async () => {
    try {
      await confirmTransfer();
      notify.success(
        "Transfer confirmed",
        "Transfer is now pending dispatch. Inventory remains reserved.",
      );
    } catch (error) {
      notify.error(
        "Confirmation failed",
        error instanceof Error ? error.message : "Unable to confirm transfer.",
      );
    }
  }, [confirmTransfer]);

  const handleSuccessReset = useCallback(() => {
    reset();
  }, [reset]);

  if (!context || !transferId) {
    return (
      <div className="relative min-h-[320px]">
        <WorkflowLoadingOverlay visible />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] flex-col">
      {currentStep < 5 ? (
        <div className="space-y-5">
          <Breadcrumbs
            items={[
              {
                label: "Dashboard",
                href: ROUTES.CENTRAL_WAREHOUSE,
              },
              {
                label: "Transfers",
                href: `${ROUTES.CENTRAL_WAREHOUSE}/transfers`,
              },
              { label: "Create Transfer" },
            ]}
          />

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
          </div>

          <TransferStepper
            currentStep={currentStep}
            maxCompletedStep={maxCompletedStep}
          />
        </div>
      ) : null}

      <div className="relative mt-6 flex-1">
        <WorkflowLoadingOverlay
          visible={isTransitioning || initialLoading || isSubmitting}
        />

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
              <TransferDetailsStep
                transferId={transferId}
                context={context}
                form={form}
                onChange={updateForm}
              />
            ) : null}

            {currentStep === 2 ? (
              <VehicleAssignmentStep
                context={context}
                form={form}
                vehicles={vehicles}
                onSelectVehicle={(vehicleId) => updateForm({ vehicleId })}
              />
            ) : null}

            {currentStep === 3 ? (
              <DriverAssignmentStep
                context={context}
                form={form}
                drivers={drivers}
                vehicles={vehicles}
                onSelectDriver={(driverId) => updateForm({ driverId })}
              />
            ) : null}

            {currentStep === 4 ? (
              <TransferReviewStep
                transferId={transferId}
                context={context}
                form={form}
                vehicles={vehicles}
                drivers={drivers}
                isSubmitting={isSubmitting}
                onConfirm={() => void handleConfirm()}
                onBack={() => void goBack()}
              />
            ) : null}

            {currentStep === 5 && result ? (
              <TransferSuccessPage
                result={result}
                onReset={handleSuccessReset}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <TransferWorkflowFooter
        currentStep={currentStep}
        showCancel={currentStep === 1}
        showBack={currentStep > 1 && currentStep < 4}
        showSaveDraft={currentStep === 1}
        continueLabel={
          currentStep === 2
            ? "Continue to Driver Selection"
            : currentStep === 3
              ? "Continue to Review"
              : "Continue"
        }
        canContinue={
          currentStep === 1
            ? canContinueStep1
            : currentStep === 2
              ? canContinueStep2
              : currentStep === 3
                ? canContinueStep3
                : false
        }
        isSubmitting={isSubmitting}
        onCancel={handleCancel}
        onBack={() => void goBack()}
        onSaveDraft={() => {
          saveDraft();
          notify.success("Draft saved");
        }}
        onContinue={currentStep < 4 ? () => void goNext() : undefined}
      />
    </div>
  );
}
