"use client";

import { useState } from "react";
import { AppProgressBar } from "next-nprogress-bar";
import { QueryClientProvider } from "@tanstack/react-query";

import { createQueryClient } from "@/config/query-client";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

function makeQueryClient() {
  return createQueryClient();
}

let browserQueryClient: ReturnType<typeof makeQueryClient> | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionProvider>
          <TooltipProvider>
            <ToastProvider>
              <AppProgressBar
                height="3px"
                color="#FF6B00"
                options={{ showSpinner: false }}
                shallowRouting
              />
              {children}
            </ToastProvider>
          </TooltipProvider>
        </SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
