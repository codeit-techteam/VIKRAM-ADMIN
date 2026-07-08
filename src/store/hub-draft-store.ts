"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  createEmptyHubDraft,
  generateHubCode,
  HUB_DRAFT_SAVED_AT_KEY,
  HUB_DRAFT_STORAGE_KEY,
} from "@/mock/hub-onboarding";
import type { HubFormSchema } from "@/schema/hub-form.schema";
import type { HubDraft } from "@/types/hub-onboarding.types";

interface HubDraftStore {
  draft: HubDraft;
  lastSavedAt: string | null;
  isDirty: boolean;
  setDraft: (draft: HubDraft) => void;
  patchDraft: (patch: Partial<HubDraft>) => void;
  updateBasic: (patch: Partial<HubDraft["basic"]>) => void;
  updateInventory: (patch: Partial<HubDraft["inventory"]>) => void;
  updateWarehouse: (patch: Partial<HubDraft["warehouse"]>) => void;
  updateManager: (patch: Partial<HubDraft["manager"]>) => void;
  updateFleet: (patch: Partial<HubDraft["fleet"]>) => void;
  updateCoverage: (patch: Partial<HubDraft["coverage"]>) => void;
  setCurrentStep: (step: number) => void;
  markSaved: (timestamp?: string) => void;
  markDirty: () => void;
  resetDraft: (existingCodes?: string[]) => void;
  syncHubCode: (existingCodes: string[]) => void;
  getFormValues: () => HubFormSchema;
}

function touch(draft: HubDraft): HubDraft {
  return { ...draft, updatedAt: new Date().toISOString() };
}

export const useHubDraftStore = create<HubDraftStore>()(
  persist(
    (set, get) => ({
      draft: createEmptyHubDraft(),
      lastSavedAt: null,
      isDirty: false,

      setDraft: (draft) => set({ draft: touch(draft), isDirty: true }),

      patchDraft: (patch) =>
        set((state) => ({
          draft: touch({ ...state.draft, ...patch }),
          isDirty: true,
        })),

      updateBasic: (patch) =>
        set((state) => ({
          draft: touch({
            ...state.draft,
            basic: { ...state.draft.basic, ...patch },
          }),
          isDirty: true,
        })),

      updateInventory: (patch) =>
        set((state) => ({
          draft: touch({
            ...state.draft,
            inventory: { ...state.draft.inventory, ...patch },
          }),
          isDirty: true,
        })),

      updateWarehouse: (patch) =>
        set((state) => ({
          draft: touch({
            ...state.draft,
            warehouse: { ...state.draft.warehouse, ...patch },
          }),
          isDirty: true,
        })),

      updateManager: (patch) =>
        set((state) => ({
          draft: touch({
            ...state.draft,
            manager: { ...state.draft.manager, ...patch },
          }),
          isDirty: true,
        })),

      updateFleet: (patch) =>
        set((state) => ({
          draft: touch({
            ...state.draft,
            fleet: { ...state.draft.fleet, ...patch },
          }),
          isDirty: true,
        })),

      updateCoverage: (patch) =>
        set((state) => ({
          draft: touch({
            ...state.draft,
            coverage: { ...state.draft.coverage, ...patch },
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
          localStorage.setItem(HUB_DRAFT_SAVED_AT_KEY, savedAt);
        }
      },

      markDirty: () => set({ isDirty: true }),

      resetDraft: (existingCodes = []) => {
        const draft = createEmptyHubDraft(existingCodes);
        set({ draft, lastSavedAt: null, isDirty: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem(HUB_DRAFT_STORAGE_KEY);
          localStorage.removeItem(HUB_DRAFT_SAVED_AT_KEY);
        }
      },

      syncHubCode: (existingCodes) => {
        const { draft } = get();
        const nextCode = generateHubCode(draft.basic.state, existingCodes);
        if (nextCode === draft.basic.hubCode) return;
        set({
          draft: touch({
            ...draft,
            basic: { ...draft.basic, hubCode: nextCode },
          }),
          isDirty: true,
        });
      },

      getFormValues: () => get().draft as HubFormSchema,
    }),
    {
      name: HUB_DRAFT_STORAGE_KEY,
      partialize: (state) => ({
        draft: state.draft,
        lastSavedAt: state.lastSavedAt,
      }),
    },
  ),
);
