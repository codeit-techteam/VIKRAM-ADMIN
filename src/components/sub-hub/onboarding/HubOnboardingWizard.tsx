"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { HubCreateSuccessModal } from "@/components/sub-hub/onboarding/HubCreateSuccessModal";
import { HubWizardProgress } from "@/components/sub-hub/onboarding/HubWizardProgress";
import { HubBasicInfoStep } from "@/components/sub-hub/onboarding/steps/HubBasicInfoStep";
import { HubCoverageStep } from "@/components/sub-hub/onboarding/steps/HubCoverageStep";
import { HubInventoryStep } from "@/components/sub-hub/onboarding/steps/HubInventoryStep";
import { HubLogisticsStep } from "@/components/sub-hub/onboarding/steps/HubLogisticsStep";
import { HubManagerStep } from "@/components/sub-hub/onboarding/steps/HubManagerStep";
import { HubReviewStep } from "@/components/sub-hub/onboarding/steps/HubReviewStep";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  generateHubCode,
  HUB_WIZARD_STEPS,
  MAIN_WAREHOUSE,
} from "@/mock/hub-onboarding";
import {
  hubFormSchema,
  STEP_FIELD_NAMES,
  STEP_SCHEMAS,
  type HubFormSchema,
} from "@/schema/hub-form.schema";
import {
  hubsService,
  mapProvisionToCreateResult,
  resolveCoords,
} from "@/services/hubs.service";
import { catalogService } from "@/services/catalog.service";
import { useHubDraftStore } from "@/store/hub-draft-store";
import type { CreateHubResult } from "@/types/hub-onboarding.types";
import { notify } from "@/utils/notify";
import { useQueryClient } from "@tanstack/react-query";

const TOTAL_STEPS = HUB_WIZARD_STEPS.length;

/** Migrate drafts saved under the old 7-step wizard (warehouse was step 3). */
function normalizeWizardStep(step: number): number {
  if (step <= 2) return step;
  if (step === 3) return 3; // old warehouse → land on manager
  if (step >= 7) return 6;
  if (step >= 4) return step - 1;
  return Math.min(Math.max(step, 1), TOTAL_STEPS);
}

function formatSavedAt(timestamp: string | null) {
  if (!timestamp) return "Not saved yet";
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HubOnboardingWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const draft = useHubDraftStore((s) => s.draft);
  const lastSavedAt = useHubDraftStore((s) => s.lastSavedAt);
  const isDirty = useHubDraftStore((s) => s.isDirty);
  const setDraft = useHubDraftStore((s) => s.setDraft);
  const setCurrentStep = useHubDraftStore((s) => s.setCurrentStep);
  const markSaved = useHubDraftStore((s) => s.markSaved);
  const resetDraft = useHubDraftStore((s) => s.resetDraft);
  const syncHubCode = useHubDraftStore((s) => s.syncHubCode);

  const [currentStep, setStep] = useState(
    normalizeWizardStep(draft.currentStep || 1),
  );
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdHub, setCreatedHub] = useState<CreateHubResult | null>(null);
  const [existingCodes, setExistingCodes] = useState<string[]>([]);

  const methods = useForm<HubFormSchema>({
    resolver: zodResolver(hubFormSchema),
    defaultValues: {
      ...draft,
      currentStep: normalizeWizardStep(draft.currentStep || 1),
      basic: {
        ...draft.basic,
        linkedWarehouseId: MAIN_WAREHOUSE.id,
        linkedWarehouseName: MAIN_WAREHOUSE.name,
        latitude: draft.basic.latitude ?? 28.6139,
        longitude: draft.basic.longitude ?? 77.209,
      },
      warehouse: {
        ...draft.warehouse,
        warehouseId: MAIN_WAREHOUSE.id,
        warehouseName: MAIN_WAREHOUSE.name,
      },
      coverage: {
        ...draft.coverage,
        latitude: draft.coverage.latitude ?? draft.basic.latitude ?? 28.6139,
        longitude: draft.coverage.longitude ?? draft.basic.longitude ?? 77.209,
      },
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    getValues,
    reset,
    trigger,
    watch,
    setValue,
    formState: { isDirty: formDirty },
  } = methods;

  useEffect(() => {
    const step = normalizeWizardStep(draft.currentStep || 1);
    reset({
      ...draft,
      currentStep: step,
      basic: {
        ...draft.basic,
        linkedWarehouseId: MAIN_WAREHOUSE.id,
        linkedWarehouseName: MAIN_WAREHOUSE.name,
        latitude: draft.basic.latitude ?? 28.6139,
        longitude: draft.basic.longitude ?? 77.209,
      },
      warehouse: {
        ...draft.warehouse,
        warehouseId: MAIN_WAREHOUSE.id,
        warehouseName: MAIN_WAREHOUSE.name,
      },
      coverage: {
        ...draft.coverage,
        latitude: draft.coverage.latitude ?? 28.6139,
        longitude: draft.coverage.longitude ?? 77.209,
      },
    });
    setStep(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void hubsService
      .list({ page: 1, limit: 100 })
      .then((res) => {
        const codes = res.data.map((hub) => hub.code);
        setExistingCodes(codes);
        syncHubCode(codes);
        const nextCode = generateHubCode(
          getValues("basic.state"),
          codes,
          getValues("basic.city"),
        );
        const currentCode = getValues("basic.hubCode");
        if (nextCode !== currentCode) {
          setValue("basic.hubCode", nextCode);
        }
      })
      .catch(() => {
        /* keep draft code if list fails */
      });
  }, [syncHubCode, getValues, setValue]);

  useEffect(() => {
    void catalogService
      .fetchInventorySkus()
      .then((skus) => {
        if (skus.length === 0) return;
        const current = getValues("inventory.skus") ?? [];
        const hasCatalogIds = current.some((sku) => sku.productId);
        if (hasCatalogIds && current.length > 0) return;
        setValue("inventory.skus", skus, { shouldDirty: true });
        useHubDraftStore.getState().updateInventory({ skus });
      })
      .catch(() => {
        /* keep empty / draft SKUs if catalog fails */
      });
  }, [getValues, setValue]);

  const watchedState = watch("basic.state");
  const watchedCity = watch("basic.city");
  const watchedPincode = watch("basic.pincode");

  useEffect(() => {
    const nextCode = generateHubCode(watchedState, existingCodes, watchedCity);
    setValue("basic.hubCode", nextCode);
    useHubDraftStore.getState().updateBasic({
      state: watchedState,
      city: watchedCity,
      hubCode: nextCode,
    });
  }, [watchedState, watchedCity, existingCodes, setValue]);

  useEffect(() => {
    const coords = resolveCoords(watchedCity || "", watchedPincode || "110001");
    setValue("basic.latitude", coords.lat);
    setValue("basic.longitude", coords.lng);
    setValue("coverage.latitude", coords.lat);
    setValue("coverage.longitude", coords.lng);
    useHubDraftStore.getState().updateBasic({
      latitude: coords.lat,
      longitude: coords.lng,
    });
    useHubDraftStore.getState().updateCoverage({
      latitude: coords.lat,
      longitude: coords.lng,
    });
  }, [watchedCity, watchedPincode, setValue]);

  const saveDraft = useCallback(
    async (silent = false) => {
      setIsSavingDraft(true);
      try {
        const values = getValues();
        const timestamp = new Date().toISOString();
        setDraft({
          ...values,
          currentStep,
          updatedAt: timestamp,
          basic: {
            ...values.basic,
            linkedWarehouseId: MAIN_WAREHOUSE.id,
            linkedWarehouseName: MAIN_WAREHOUSE.name,
          },
          warehouse: {
            ...values.warehouse,
            warehouseId: MAIN_WAREHOUSE.id,
            warehouseName: MAIN_WAREHOUSE.name,
          },
        });
        markSaved(timestamp);
        reset(values);
        if (!silent) {
          notify.success(
            "Draft saved",
            "Your hub onboarding progress is protected.",
          );
        }
      } finally {
        setIsSavingDraft(false);
      }
    },
    [getValues, currentStep, setDraft, markSaved, reset],
  );

  useEffect(() => {
    if (!isDirty && !formDirty) return;
    const timer = window.setInterval(() => {
      void saveDraft(true);
    }, 20000);
    return () => window.clearInterval(timer);
  }, [isDirty, formDirty, saveDraft]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty && !formDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, formDirty]);

  const goToStep = (step: number) => {
    setStep(step);
    setCurrentStep(step);
    const values = getValues();
    setDraft({ ...values, currentStep: step });
  };

  const validateCurrentStep = async () => {
    if (currentStep === TOTAL_STEPS) {
      return trigger();
    }

    const schema = STEP_SCHEMAS[currentStep as keyof typeof STEP_SCHEMAS];
    const values = getValues();
    const result = schema.safeParse(values);

    if (!result.success) {
      const fields = STEP_FIELD_NAMES[
        currentStep as keyof typeof STEP_FIELD_NAMES
      ] as unknown as Array<keyof HubFormSchema | string>;
      await trigger(fields as never);
      notify.error(
        "Validation failed",
        "Please fix the highlighted fields before continuing.",
      );
      return false;
    }

    if (currentStep === 1) {
      const name = values.basic.hubName.trim().toLowerCase();
      const code = values.basic.hubCode.trim().toUpperCase();
      if (existingCodes.some((c) => c.toUpperCase() === code)) {
        notify.error(
          "Duplicate hub code",
          "A hub with this code already exists in the network.",
        );
        return false;
      }
      try {
        const res = await hubsService.list({
          page: 1,
          limit: 100,
          search: name,
        });
        const duplicate = res.data.some(
          (hub) => hub.name.toLowerCase() === name,
        );
        if (duplicate) {
          notify.error(
            "Duplicate hub name",
            "A hub with this name already exists in the network.",
          );
          return false;
        }
      } catch {
        /* allow continue if list fails; backend will enforce uniqueness */
      }
    }

    return true;
  };

  const goToNextStep = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    await saveDraft(true);
    goToStep(Math.min(currentStep + 1, TOTAL_STEPS));
  };

  const goToPreviousStep = () => {
    goToStep(Math.max(currentStep - 1, 1));
  };

  const onCreateHub = async (data: HubFormSchema) => {
    setIsPublishing(true);
    try {
      const provisioned = await hubsService.provision(data);
      const result = mapProvisionToCreateResult(provisioned);
      setCreatedHub(result);
      setSuccessOpen(true);
      resetDraft([...existingCodes, provisioned.hub.code]);
      setExistingCodes((prev) => [...prev, provisioned.hub.code]);
      await queryClient.invalidateQueries({ queryKey: ["admin-hubs"] });
      notify.success(
        "Hub provisioned",
        `${result.hubName} is live. Manager login: ${result.managerUsername}`,
      );
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error instanceof Error
          ? error.message
          : "Please review and try again.");
      notify.error("Unable to create hub", message);
    } finally {
      setIsPublishing(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <HubBasicInfoStep />;
      case 2:
        return <HubInventoryStep />;
      case 3:
        return <HubManagerStep />;
      case 4:
        return <HubLogisticsStep />;
      case 5:
        return <HubCoverageStep />;
      case 6:
        return <HubReviewStep onEditStep={goToStep} />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onCreateHub)}
        className="relative -mx-6 -mb-6 flex min-h-[calc(100vh-4rem)] flex-col"
      >
        <div className="flex-1 space-y-6 px-6 pt-0 pb-28">
          <Breadcrumbs
            items={[
              { label: "Sub-Hub Network", href: ROUTES.SUB_HUB_NETWORK },
              { label: "Add New Hub" },
            ]}
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold tracking-wider text-[#9A3412] uppercase">
                Hub Setup Mode
              </div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Add New Hub</h1>
              <p className="mt-1 text-sm text-[#64748B]">
                Complete the 6-step onboarding wizard to register a hub across
                inventory, logistics, and operations.
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="h-10 shrink-0 gap-2 px-4"
              render={<Link href={ROUTES.SUB_HUB_NETWORK} />}
            >
              <ArrowLeft className="size-4" />
              Back to All Sub-Hubs
            </Button>
          </div>

          <HubWizardProgress currentStep={currentStep} onStepClick={goToStep} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-gray-100 bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 px-5"
                onClick={goToPreviousStep}
              >
                <ArrowLeft className="size-4" />
                Previous
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 px-5"
                disabled
              >
                <ArrowLeft className="size-4" />
                Previous
              </Button>
            )}

            <button
              type="button"
              className="text-sm font-medium text-gray-500 underline-offset-2 hover:text-[#1A1A1A] hover:underline"
              onClick={() => void saveDraft()}
              disabled={isSavingDraft}
            >
              Save as Draft
            </button>
          </div>

          <HubWizardProgress currentStep={currentStep} variant="bar" />

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="hidden items-center gap-2 text-sm text-gray-400 lg:flex">
              <Clock className="size-4" />
              <span>
                {isSavingDraft
                  ? "Auto-saving... Your progress is protected."
                  : `Last saved · ${formatSavedAt(lastSavedAt)}`}
              </span>
            </div>

            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                className="h-11 gap-2 bg-[#9A3412] px-6 hover:bg-[#7C2D12]"
                onClick={() => void goToNextStep()}
              >
                Next Step
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="h-11 gap-2 px-6"
                disabled={isPublishing}
              >
                <Rocket className="size-4" />
                {isPublishing ? "Creating..." : "Create Hub"}
              </Button>
            )}
          </div>
        </div>
      </form>

      <HubCreateSuccessModal
        open={successOpen}
        result={createdHub}
        onCreateAnother={() => {
          setSuccessOpen(false);
          setCreatedHub(null);
          resetDraft(existingCodes);
          reset(useHubDraftStore.getState().draft);
          goToStep(1);
        }}
      />
    </FormProvider>
  );
}
