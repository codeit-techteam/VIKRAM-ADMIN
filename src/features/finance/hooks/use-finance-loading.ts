"use client";

import { useEffect, useState } from "react";

const MOCK_API_DELAY_MS = 500;

export function useFinanceLoading(deps?: unknown) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(
      () => setIsLoading(false),
      MOCK_API_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [deps]);

  return { isLoading };
}
