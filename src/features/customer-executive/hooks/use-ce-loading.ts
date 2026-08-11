"use client";

/** @deprecated Use store loading flags instead of fake delays. */
export function useCeLoading(_deps?: unknown) {
  return { isLoading: false, reload: () => undefined };
}
