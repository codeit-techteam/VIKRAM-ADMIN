"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  createEmptyManagerDraft,
  MANAGER_DRAFT_SAVED_AT_KEY,
  MANAGER_DRAFT_STORAGE_KEY,
} from "@/mock/manager-onboarding";
import type { ManagerOnboardingSchema } from "@/features/user-management/schema/manager-onboarding.schema";
import type {
  ManagerDocuments,
  ManagerOnboardingDraft,
  ManagerPermissionSet,
} from "@/features/user-management/types/manager-onboarding.types";

interface ManagerDraftStore {
  draft: ManagerOnboardingDraft;
  lastSavedAt: string | null;
  isDirty: boolean;
  setDraft: (draft: ManagerOnboardingDraft) => void;
  patchDraft: (patch: Partial<ManagerOnboardingDraft>) => void;
  updateDocuments: (patch: Partial<ManagerDocuments>) => void;
  updatePermissions: (patch: Partial<ManagerPermissionSet>) => void;
  setCurrentStep: (step: number) => void;
  setPermissionsSkipped: (skipped: boolean) => void;
  markSaved: (timestamp?: string) => void;
  markDirty: () => void;
  resetDraft: (existingEmployeeIds?: string[]) => void;
  getFormValues: () => ManagerOnboardingSchema;
}

function touch(draft: ManagerOnboardingDraft): ManagerOnboardingDraft {
  return { ...draft, updatedAt: new Date().toISOString() };
}

export const useManagerDraftStore = create<ManagerDraftStore>()(
  persist(
    (set, get) => ({
      draft: createEmptyManagerDraft(),
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

      updatePermissions: (patch) =>
        set((state) => ({
          draft: touch({
            ...state.draft,
            permissions: { ...state.draft.permissions, ...patch },
          }),
          isDirty: true,
        })),

      setCurrentStep: (step) =>
        set((state) => ({
          draft: touch({ ...state.draft, currentStep: step }),
        })),

      setPermissionsSkipped: (skipped) =>
        set((state) => ({
          draft: touch({ ...state.draft, permissionsSkipped: skipped }),
          isDirty: true,
        })),

      markSaved: (timestamp) => {
        const savedAt = timestamp ?? new Date().toISOString();
        set({ lastSavedAt: savedAt, isDirty: false });
        if (typeof window !== "undefined") {
          localStorage.setItem(MANAGER_DRAFT_SAVED_AT_KEY, savedAt);
        }
      },

      markDirty: () => set({ isDirty: true }),

      resetDraft: (existingEmployeeIds = []) => {
        const draft = createEmptyManagerDraft(existingEmployeeIds);
        set({ draft, lastSavedAt: null, isDirty: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem(MANAGER_DRAFT_STORAGE_KEY);
          localStorage.removeItem(MANAGER_DRAFT_SAVED_AT_KEY);
        }
      },

      getFormValues: () => get().draft as ManagerOnboardingSchema,
    }),
    {
      name: MANAGER_DRAFT_STORAGE_KEY,
      partialize: (state) => ({
        draft: state.draft,
        lastSavedAt: state.lastSavedAt,
      }),
    },
  ),
);
