import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  breadcrumb: string;
  children: ReactNode;
  hero: ReactNode;
  className?: string;
}

export function AuthLayout({
  breadcrumb,
  children,
  hero,
  className,
}: AuthLayoutProps) {
  return (
    <div className={cn("flex min-h-svh flex-col lg:flex-row", className)}>
      <div className="relative flex w-full flex-col bg-white lg:w-[42%] xl:w-[40%]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,107,0,0.04)_0%,_transparent_60%)]"
          aria-hidden="true"
        />

        <header className="relative z-10 px-8 pt-8 lg:px-10">
          <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
            {breadcrumb}
          </p>
        </header>

        <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>

      <div className="hidden lg:block lg:flex-1">{hero}</div>
    </div>
  );
}
