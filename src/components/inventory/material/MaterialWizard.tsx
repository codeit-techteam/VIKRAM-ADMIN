"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { MaterialBasicInfo } from "@/components/inventory/material/MaterialBasicInfo";
import { MaterialCategory } from "@/components/inventory/material/MaterialCategory";
import { MaterialPricing } from "@/components/inventory/material/MaterialPricing";
import { MaterialReview } from "@/components/inventory/material/MaterialReview";
import { MaterialSkuManager } from "@/components/inventory/material/MaterialSkuManager";
import { WarehouseSettings } from "@/components/inventory/material/WarehouseSettings";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  MATERIAL_DRAFT_SAVED_AT_KEY,
  MATERIAL_DRAFT_STORAGE_KEY,
  MATERIAL_FORM_DEFAULT_VALUES,
} from "@/mock/materials";
import {
  materialFormSchema,
  STEP_FIELD_NAMES,
  STEP_SCHEMAS,
  type MaterialFormSchema,
} from "@/schema/material-form.schema";
import type { MaterialWizardStep } from "@/types/material.types";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

const WIZARD_STEPS: MaterialWizardStep[] = [
  { id: 1, label: "Basic Information", shortLabel: "Basic Info" },
  { id: 2, label: "Category Assignment", shortLabel: "Category" },
  { id: 3, label: "SKU & Variants", shortLabel: "SKU & Variants" },
  { id: 4, label: "Pricing", shortLabel: "Pricing" },
  { id: 5, label: "Warehouse Settings", shortLabel: "Warehouse Settings" },
  { id: 6, label: "Review & Publish", shortLabel: "Review & Publish" },
];

const TOTAL_STEPS = WIZARD_STEPS.length;
const INVENTORY_ROUTE = `${ROUTES.CENTRAL_WAREHOUSE}/inventory`;

function formatSavedAt(timestamp: string | null) {
  if (!timestamp) return "Not saved yet";
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WizardProgress({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex min-w-[720px] items-center">
        {WIZARD_STEPS.map((step, index) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => isComplete && onStepClick(step.id)}
                disabled={!isComplete}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  isComplete && "cursor-pointer hover:opacity-80",
                  !isComplete && !isCurrent && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isComplete && "bg-primary text-white",
                    isCurrent &&
                      "text-primary ring-primary bg-orange-50 ring-2",
                    !isComplete && !isCurrent && "bg-gray-100 text-gray-400",
                  )}
                >
                  {isComplete ? <Check className="size-4" /> : step.id}
                </span>
                <span
                  className={cn(
                    "hidden text-sm font-medium lg:inline",
                    isCurrent ? "text-primary" : "text-gray-500",
                  )}
                >
                  {step.shortLabel}
                </span>
              </button>
              {index < WIZARD_STEPS.length - 1 && (
                <ChevronRight className="mx-2 size-4 shrink-0 text-gray-300" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MaterialWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const methods = useForm<MaterialFormSchema>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: MATERIAL_FORM_DEFAULT_VALUES,
    mode: "onChange",
  });

  const {
    handleSubmit,
    getValues,
    reset,
    trigger,
    formState: { isDirty },
  } = methods;

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(MATERIAL_DRAFT_STORAGE_KEY);
      const savedAt = localStorage.getItem(MATERIAL_DRAFT_SAVED_AT_KEY);

      if (savedDraft) {
        reset(JSON.parse(savedDraft) as MaterialFormSchema);
      }

      if (savedAt) {
        setLastSavedAt(savedAt);
      }
    } catch {
      // Ignore invalid draft payloads in local storage.
    }
  }, [reset]);

  const saveDraft = useCallback(
    async (silent = false) => {
      setIsSavingDraft(true);

      try {
        const values = getValues();
        const timestamp = new Date().toISOString();

        localStorage.setItem(
          MATERIAL_DRAFT_STORAGE_KEY,
          JSON.stringify(values),
        );
        localStorage.setItem(MATERIAL_DRAFT_SAVED_AT_KEY, timestamp);
        setLastSavedAt(timestamp);
        reset(values);

        if (!silent) {
          notify.success(
            "Draft saved",
            "Your material draft has been saved locally.",
          );
        }
      } finally {
        setIsSavingDraft(false);
      }
    },
    [getValues, reset],
  );

  useEffect(() => {
    if (!isDirty) return;

    const timer = window.setInterval(() => {
      void saveDraft(true);
    }, 30000);

    return () => window.clearInterval(timer);
  }, [isDirty, saveDraft]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const validateCurrentStep = async () => {
    if (currentStep === 6) {
      return trigger();
    }

    const schema = STEP_SCHEMAS[currentStep as keyof typeof STEP_SCHEMAS];
    const values = getValues();
    const result = schema.safeParse(values);

    if (!result.success) {
      const fields = STEP_FIELD_NAMES[
        currentStep as keyof typeof STEP_FIELD_NAMES
      ] as unknown as (keyof MaterialFormSchema)[];
      await trigger(fields);
      notify.error(
        "Validation failed",
        "Please fix the highlighted fields before continuing.",
      );
      return false;
    }

    return true;
  };

  const goToNextStep = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    setCurrentStep((step) => Math.min(step + 1, TOTAL_STEPS));
  };

  const goToPreviousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  const onPublish = (data: MaterialFormSchema) => {
    console.log("Publish material:", data);
    localStorage.removeItem(MATERIAL_DRAFT_STORAGE_KEY);
    localStorage.removeItem(MATERIAL_DRAFT_SAVED_AT_KEY);
    notify.success(
      "Material published",
      `${data.materialName} is ready for backend integration.`,
    );
    router.push(INVENTORY_ROUTE);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <MaterialBasicInfo />;
      case 2:
        return <MaterialCategory />;
      case 3:
        return <MaterialSkuManager />;
      case 4:
        return <MaterialPricing />;
      case 5:
        return <WarehouseSettings />;
      case 6:
        return <MaterialReview />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onPublish)}
        className="relative -mx-6 -mb-6 flex min-h-[calc(100vh-4rem)] flex-col"
      >
        <div className="flex-1 space-y-6 px-6 pt-0 pb-28">
          <Breadcrumbs
            items={[
              { label: "Central Warehouse", href: ROUTES.CENTRAL_WAREHOUSE },
              { label: "Inventory", href: INVENTORY_ROUTE },
              { label: "Add New Material" },
            ]}
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">
                Add New Material
              </h1>
              <p className="mt-1 text-sm text-[#64748B]">
                Create a material with multiple SKUs, pricing, and warehouse
                configuration.
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="h-10 shrink-0 gap-2 px-4"
              render={<Link href={INVENTORY_ROUTE} />}
            >
              <ArrowLeft className="size-4" />
              Back to Inventory
            </Button>
          </div>

          <WizardProgress
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />

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

        <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="size-4" />
            <span>
              {isSavingDraft
                ? "Saving draft..."
                : `Last saved at ${formatSavedAt(lastSavedAt)}`}
            </span>
            {isDirty && (
              <span className="text-amber-600">· Unsaved changes</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                className="h-10 px-5"
                onClick={goToPreviousStep}
              >
                {currentStep === 6 ? "Back" : "Previous"}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              className="h-10 px-5"
              onClick={() => void saveDraft()}
              disabled={isSavingDraft}
            >
              Save Draft
            </Button>

            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                className="h-10 px-5"
                onClick={() => void goToNextStep()}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" className="h-10 px-5">
                Publish Material
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
