"use client";

import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  title?: string;
  message?: string;
  className?: string;
}

export function ConfirmationModal({
  title = "Important Confirmation",
  message = "Please confirm allocation. This action will reserve the inventory. Once confirmed, stock will be moved to the dispatch queue immediately.",
  className,
}: ConfirmationModalProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-orange-200 bg-orange-50 p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-primary mt-0.5 size-5 shrink-0" />
        <div>
          <h4 className="font-bold text-[#1A1A1A]">{title}</h4>
          <p className="mt-2 text-sm text-[#64748B]">{message}</p>
        </div>
      </div>
    </div>
  );
}
