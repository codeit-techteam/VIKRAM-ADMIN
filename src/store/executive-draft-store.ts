"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ExecutiveOnboardingSchema } from "@/features/user-management/schema/executive-onboarding.schema";
import type {
  ExecutiveDocuments,
  ExecutiveOnboardingDraft,
  ExecutiveResponsibilities,
} from "@/features/user-management/types/executive-onboarding.types";
import {
  createEmptyExecutiveDraft,
  EXECUTIVE_DRAFT_SAVED_AT_KEY,
  EXECUTIVE_DRAFT_STORAGE_KEY,
} from "@/mock/executive-onboarding";

interface ExecutiveDraftStore {
  draft: ExecutiveOnboardingDraft;
  lastSavedAt: string | null;
  isDirty: boolean;
  setDraft: (draft: ExecutiveOnboardingDraft) => void;
  patchDraft: (patch: Partial<ExecutiveOnboardingDraft>) => void;
  updateDocuments: (patch: Partial<ExecutiveDocuments>) => void;
  updateResponsibilities: (patch: Partial<ExecutiveResponsibilities>) => void;
  setCurrentStep: (step: number) => void;
  markSaved: (timestamp?: string) => void;
  markDirty: () => void;
  resetDraft: (existingEmployeeIds?: string[]) => void;
  getFormValues: () => ExecutiveOnboardingSchema;
}

function touch(draft: ExecutiveOnboardingDraft): ExecutiveOnboardingDraft {
  return { ...draft, updatedAt: new Date().toISOString() };
}

export const useExecutiveDraftStore = create<ExecutiveDraftStore>()(
  persist(
    (set, get) => ({
      draft: createEmptyExecutiveDraft(),
      lastSavedAt: null,
      isDirty: false,

      setDraft: (draft) => set({ draft: touch(draft), isDirty: true }),

      patchDraft: (patch) =>
        set((state) => ({
          draft: touch({ ...state.draft, ...patch }),
          isDirty: true,
        })),

      updateDocuments: (patch) =>
        set((state) => ({
          draft: touch({
            ...state.draft,
            documents: { ...state.draft.documents, ...patch },
          }),
          isDirty: true,
        })),

      updateResponsibilities: (patch) =>
        set((state) => ({
          draft: touch({
            ...state.draft,
            responsibilities: { ...state.draft.responsibilities, ...patch },
          }),
          isDirty: true,
        })),

      setCurrentStep: (step) =>
        set((state) => ({
          draft: touch({ ...state.draft, currentStep: step }),
        })),

      markSaved: (timestamp) => {
        const savedAt = timestamp ?? new Date().toISOString();
        set({ lastSavedAt: savedAt, isDirty: false });
        if (typeof window !== "undefined") {
          localStorage.setItem(EXECUTIVE_DRAFT_SAVED_AT_KEY, savedAt);
        }
      },

      markDirty: () => set({ isDirty: true }),

      resetDraft: (existingEmployeeIds = []) => {
        const draft = createEmptyExecutiveDraft(existingEmployeeIds);
        set({ draft, lastSavedAt: null, isDirty: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem(EXECUTIVE_DRAFT_STORAGE_KEY);
          localStorage.removeItem(EXECUTIVE_DRAFT_SAVED_AT_KEY);
        }
      },

      getFormValues: () => get().draft as ExecutiveOnboardingSchema,
    }),
    {
      name: EXECUTIVE_DRAFT_STORAGE_KEY,
      partialize: (state) => ({
        draft: state.draft,
        lastSavedAt: state.lastSavedAt,
      }),
    },
  ),
);
