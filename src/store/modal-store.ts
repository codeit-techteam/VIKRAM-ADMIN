import { create } from "zustand";

interface ModalState<T = unknown> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
  setData: (data: T | null) => void;
}

export const createModalStore = <T = unknown>() =>
  create<ModalState<T>>()((set) => ({
    isOpen: false,
    data: null,
    open: (data) => set({ isOpen: true, data: data ?? null }),
    close: () => set({ isOpen: false, data: null }),
    setData: (data) => set({ data }),
  }));

export const useGlobalModalStore = createModalStore();
