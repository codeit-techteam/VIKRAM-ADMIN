"use client";

import { useEffect, useState } from "react";

const MOCK_API_DELAY_MS = 600;

export function useLogisticsLoading() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setIsLoading(false),
      MOCK_API_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, []);

  const reload = () => {
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), MOCK_API_DELAY_MS);
  };

  return { isLoading, reload };
}
