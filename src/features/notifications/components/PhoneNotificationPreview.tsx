"use client";

import Image from "next/image";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";

interface PhoneNotificationPreviewProps {
  title: string;
  message: string;
  imageUrl?: string;
  appName?: string;
  className?: string;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function PhoneNotificationPreview({
  title,
  message,
  imageUrl,
  appName = "Bajriwala",
  className,
}: PhoneNotificationPreviewProps) {
  const displayTitle = title.trim() || "Notification title";
  const displayMessage =
    message.trim() || "Your message will appear here as users type.";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <p className="mb-4 text-center text-xs font-medium tracking-wide text-gray-400 uppercase">
        Live Preview
      </p>

      <div className="w-[280px] rounded-[2rem] border-8 border-gray-900 bg-black p-2 shadow-xl">
        <div className="overflow-hidden rounded-[1.4rem] bg-gradient-to-b from-slate-800 to-slate-900 px-3 pt-8 pb-10">
          <div className="mb-6 flex items-center justify-between px-1 text-[10px] text-white/60">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-white/80" />
              <span className="size-1.5 rounded-full bg-white/80" />
              <span className="size-1.5 rounded-full bg-white/50" />
            </div>
          </div>

          <div className="rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur">
            <div className="flex items-start gap-2.5">
              <div className="bg-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Bell className="size-4 text-white" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[11px] font-medium text-gray-500">
                    {appName}
                  </p>
                  <span className="shrink-0 text-[10px] text-gray-400">
                    now
                  </span>
                </div>

                <p className="mt-0.5 text-sm leading-snug font-semibold text-[#1A1A1A]">
                  {truncateText(displayTitle, 50)}
                </p>

                <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
                  {truncateText(displayMessage, 120)}
                </p>

                {imageUrl ? (
                  <div className="relative mt-2 aspect-[2/1] overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={imageUrl}
                      alt="Notification preview"
                      fill
                      className="object-cover"
                      sizes="240px"
                      unoptimized={imageUrl.startsWith("blob:")}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 max-w-[280px] text-center text-xs text-gray-400">
        Preview updates in real time as you compose your notification.
      </p>
    </div>
  );
}
