"use client";

import { useEffect, useState } from "react";

import { debounce } from "@/utils/debounce";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = debounce(() => setDebouncedValue(value), delay);
    handler();
    return () => {
      // debounce cleanup handled by clearing on next call
    };
  }, [value, delay]);

  return debouncedValue;
}
