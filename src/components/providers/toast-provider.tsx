"use client";

import { Toaster } from "@/components/ui/sonner";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "shadow-card rounded-xl",
          },
        }}
      />
    </>
  );
}
