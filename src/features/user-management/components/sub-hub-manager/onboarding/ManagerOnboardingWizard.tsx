"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  SkipForward,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { ManagerCreateSuccessScreen } from "@/features/user-management/components/sub-hub-manager/onboarding/ManagerCreateSuccessScreen";
import { ManagerWizardSidebar } from "@/features/user-management/components/sub-hub-manager/onboarding/ManagerWizardSidebar";
import { ManagerBasicInfoStep } from "@/features/user-management/components/sub-hub-manager/onboarding/steps/ManagerBasicInfoStep";
import { ManagerCredentialsStep } from "@/features/user-management/components/sub-hub-manager/onboarding/steps/ManagerCredentialsStep";
import { ManagerDocumentsStep } from "@/features/user-management/components/sub-hub-manager/onboarding/steps/ManagerDocumentsStep";
import { ManagerEmploymentStep } from "@/features/user-management/components/sub-hub-manager/onboarding/steps/ManagerEmploymentStep";
import { ManagerHubAssignmentStep } from "@/features/user-management/components/sub-hub-manager/onboarding/steps/ManagerHubAssignmentStep";
import { ManagerPermissionsStep } from "@/features/user-management/components/sub-hub-manager/onboarding/steps/ManagerPermissionsStep";
import { ManagerReviewStep } from "@/features/user-management/components/sub-hub-manager/onboarding/steps/ManagerReviewStep";
import {
  managerOnboardingSchema,
  STEP_FIELD_NAMES,
  STEP_SCHEMAS,
  type ManagerOnboardingSchema,
} from "@/features/user-management/schema/manager-onboarding.schema";
import type { CreateManagerResult } from "@/features/user-management/types/manager-onboarding.types";
import { MANAGER_WIZARD_STEPS } from "@/mock/manager-onboarding";
import { useManagerDraftStore } from "@/store/manager-draft-store";
import { useSubHubManagerStore } from "@/store/sub-hub-manager-store";
import { notify } from "@/utils/notify";

const TOTAL_STEPS = MANAGER_WIZARD_STEPS.length;

function formatSavedAt(timestamp: string | null) {
  if (!timestamp) return "Not saved yet";
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WizardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="hidden h-72 rounded-xl xl:block" />
      </div>
    </div>
  );
}

export function ManagerOnboardingWizard() {
  const draft = useManagerDraftStore((s) => s.draft);
  const lastSavedAt = useManagerDraftStore((s) => s.lastSavedAt);
  const isDirty = useManagerDraftStore((s) => s.isDirty);
  const setDraft = useManagerDraftStore((s) => s.setDraft);
  const setCurrentStep = useManagerDraftStore((s) => s.setCurrentStep);
  const setPermissionsSkipped = useManagerDraftStore(
    (s) => s.setPermissionsSkipped,
  );
  const markSaved = useManagerDraftStore((s) => s.markSaved);
  const resetDraft = useManagerDraftStore((s) => s.resetDraft);

  const createManagerFromDraft = useSubHubManagerStore(
    (s) => s.createManagerFromDraft,
  );
  const managers = useSubHubManagerStore((s) => s.managers);

  const [currentStep, setStep] = useState(draft.currentStep || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdManager, setCreatedManager] =
    useState<CreateManagerResult | null>(null);

  const methods = useForm<ManagerOnboardingSchema>({
    resolver: zodResolver(managerOnboardingSchema),
    defaultValues: draft as ManagerOnboardingSchema,
    mode: "onChange",
  });

  const {
    handleSubmit,
    getValues,
    reset,
    trigger,
    formState: { isDirty: formDirty },
  } = methods;

  useEffect(() => {
    reset(draft as ManagerOnboardingSchema);
    setStep(draft.currentStep || 1);
    const timer = window.setTimeout(() => setIsLoading(false), 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveDraft = useCallback(
    async (silent = false) => {
      setIsSavingDraft(true);
      try {
        const values = getValues();
        const timestamp = new Date().toISOString();
        setDraft({
          ...(values as typeof draft),
          currentStep,
          updatedAt: timestamp,
        });
        markSaved(timestamp);
        reset(values);
        if (!silent) {
          notify.success(
            "Draft Saved Successfully",
            "Your manager onboarding progress is protected.",
          );
        }
      } finally {
        setIsSavingDraft(false);
      }
    },
    [getValues, currentStep, setDraft, markSaved, reset, draft],
  );

  useEffect(() => {
    if (!isDirty && !formDirty) return;
    const timer = window.setInterval(() => {
      void saveDraft(true);
    }, 15000);
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
    setDraft({ ...(values as typeof draft), currentStep: step });
  };

  const validateCurrentStep = async () => {
    if (currentStep === 4 && draft.permissionsSkipped) {
      return true;
    }

    if (currentStep === 7) {
      return trigger();
    }

    const schema = STEP_SCHEMAS[currentStep as keyof typeof STEP_SCHEMAS];
    if (!schema) return true;

    const values = getValues();
    const result = schema.safeParse(values);

    if (!result.success) {
      const fields = STEP_FIELD_NAMES[
        currentStep as keyof typeof STEP_FIELD_NAMES
      ] as unknown as Array<keyof ManagerOnboardingSchema | string>;
      await trigger(fields as never);
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
    await saveDraft(true);
    goToStep(Math.min(currentStep + 1, TOTAL_STEPS));
  };

  const goToPreviousStep = () => {
    goToStep(Math.max(currentStep - 1, 1));
  };

  const skipPermissions = async () => {
    setPermissionsSkipped(true);
    setValuePermissionsSkipped();
    await saveDraft(true);
    notify.success(
      "Permissions Skipped",
      "Default role permissions will be applied.",
    );
    goToStep(5);
  };

  const setValuePermissionsSkipped = () => {
    methods.setValue("permissionsSkipped", true);
    const values = getValues();
    setDraft({ ...(values as typeof draft), permissionsSkipped: true });
  };

  const onCreateManager = async (data: ManagerOnboardingSchema) => {
    setIsCreating(true);
    try {
      const result = createManagerFromDraft(data);
      setCreatedManager(result);
      const existingIds = managers.map((m) => m.employeeId);
      resetDraft(existingIds);
      notify.success(
        "Manager Created Successfully",
        `${result.name} has been provisioned and assigned to ${result.hubName}.`,
      );
    } catch (error) {
      notify.error(
        "Unable to create manager",
        error instanceof Error ? error.message : "Please review and try again.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateAnother = () => {
    const existingIds = useSubHubManagerStore
      .getState()
      .managers.map((m) => m.employeeId);
    resetDraft(existingIds);
    reset(useManagerDraftStore.getState().draft as ManagerOnboardingSchema);
    setCreatedManager(null);
    goToStep(1);
  };

  const renderStep = () => {
    if (isLoading) return <WizardSkeleton />;

    switch (currentStep) {
      case 1:
        return <ManagerBasicInfoStep />;
      case 2:
        return <ManagerEmploymentStep />;
      case 3:
        return <ManagerHubAssignmentStep />;
      case 4:
        return <ManagerPermissionsStep />;
      case 5:
        return <ManagerCredentialsStep />;
      case 6:
        return <ManagerDocumentsStep />;
      case 7:
        return <ManagerReviewStep onEditStep={goToStep} />;
      default:
        return null;
    }
  };

  if (createdManager) {
    return (
      <ManagerCreateSuccessScreen
        result={createdManager}
        onCreateAnother={handleCreateAnother}
      />
    );
  }

  const continueLabel =
    currentStep === 6
      ? "Review Application"
      : currentStep === 5
        ? "Continue to Documents"
        : currentStep === 4
          ? "Continue to Login Credentials"
          : currentStep === 3
            ? "Continue to Permissions"
            : currentStep === 2
              ? "Continue to Assignment"
              : "Continue";

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onCreateManager)}
        className="relative -mx-6 -mb-6 flex min-h-[calc(100vh-4rem)] flex-col"
      >
        <div className="flex-1 space-y-6 px-6 pt-0 pb-28">
          <Breadcrumbs
            items={[
              { label: "User Management", href: ROUTES.USER_MANAGEMENT },
              {
                label: "Sub-Hub Managers",
                href: ROUTES.SUB_HUB_MANAGERS,
              },
              { label: "Create Manager" },
            ]}
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold tracking-wider text-[#9A3412] uppercase">
                Manager Onboarding
              </div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">
                Create Sub-Hub Manager
              </h1>
              <p className="mt-1 text-sm text-[#64748B]">
                Complete the 7-step wizard to onboard a new manager and assign
                them to a hub.
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="h-10 shrink-0 gap-2 px-4"
              render={<Link href={ROUTES.SUB_HUB_MANAGERS} />}
            >
              <ArrowLeft className="size-4" />
              Back to Managers
            </Button>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <ManagerWizardSidebar
              currentStep={currentStep}
              permissionsSkipped={draft.permissionsSkipped}
              onStepClick={goToStep}
            />

            <div className="min-w-0 flex-1">
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
          </div>
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

            {currentStep === 4 && (
              <Button
                type="button"
                variant="ghost"
                className="h-10 gap-2 text-gray-500"
                onClick={() => void skipPermissions()}
              >
                <SkipForward className="size-4" />
                Skip Permissions
              </Button>
            )}

            <button
              type="button"
              className="text-sm font-medium text-gray-500 underline-offset-2 hover:text-[#1A1A1A] hover:underline"
              onClick={() => void saveDraft()}
              disabled={isSavingDraft}
            >
              Save Draft
            </button>
          </div>

          <div className="hidden items-center gap-2 text-sm text-gray-400 lg:flex">
            <Clock className="size-4" />
            <span>
              {isSavingDraft
                ? "Auto-saving..."
                : `Last saved · ${formatSavedAt(lastSavedAt)}`}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                className="h-11 gap-2 bg-[#9A3412] px-6 hover:bg-[#7C2D12]"
                onClick={() => void goToNextStep()}
              >
                {continueLabel}
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="h-11 gap-2 px-6"
                disabled={isCreating}
              >
                <UserPlus className="size-4" />
                {isCreating ? "Creating..." : "Create Manager & Provision ID"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
