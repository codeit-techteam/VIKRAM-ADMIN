"use client";

import { Bell, Calendar, HelpCircle } from "lucide-react";

import { EnterpriseGlobalSearch } from "@/components/layout/global-search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROLE_LABELS } from "@/constants/roles";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface AppTopbarProps {
  sectionLabel?: string;
  pageLabel: string;
  showUserId?: boolean;
  variant?: "default" | "minimal";
  searchPlaceholder?: string;
}

function formatTopbarDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AppTopbar({
  sectionLabel,
  pageLabel,
  showUserId = true,
  variant = "default",
  searchPlaceholder,
}: AppTopbarProps) {
  const { user } = useAuth();
  const isMinimal = variant === "minimal";

  const initials =
    user?.name
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "SA";

  const roleLabel = user?.role ? ROLE_LABELS[user.role] : "Super Admin";

  return (
    <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center gap-4 border-b border-gray-100 bg-white px-4 sm:px-6">
      {!isMinimal && (
        <>
          <div className="hidden min-w-fit lg:block">
            {sectionLabel ? (
              <div>
                <p className="text-xs text-gray-400">{sectionLabel}</p>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  {pageLabel}
                </p>
              </div>
            ) : (
              <p className="text-sm font-medium text-[#64748B]">{pageLabel}</p>
            )}
          </div>

          <Separator orientation="vertical" className="hidden h-8 lg:block" />
        </>
      )}

      <div
        className={cn(
          "relative min-w-0 flex-1",
          isMinimal ? "max-w-none" : "lg:max-w-xl",
        )}
      >
        <EnterpriseGlobalSearch
          placeholder={
            searchPlaceholder ??
            (isMinimal
              ? "Search resources, logs, or assets..."
              : "Search orders, hubs, customers...")
          }
        />
      </div>

      {isMinimal ? (
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="icon" className="size-9 text-gray-500">
            <Bell className="size-[18px]" />
            <span className="sr-only">Notifications</span>
          </Button>
          <span className="text-primary hidden text-sm font-semibold sm:inline">
            Bajriwala
          </span>
        </div>
      ) : (
        <>
          <div className="hidden shrink-0 items-center gap-2 text-sm text-[#64748B] md:flex">
            <Calendar className="size-4 text-gray-400" aria-hidden="true" />
            <span>{formatTopbarDate(new Date())}</span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="relative size-9 text-gray-500"
            >
              <Bell className="size-[18px]" />
              <span className="bg-primary absolute top-1.5 right-1.5 size-2 rounded-full ring-2 ring-white" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 text-gray-500"
            >
              <HelpCircle className="size-[18px]" />
              <span className="sr-only">Help</span>
            </Button>
          </div>

          <Separator orientation="vertical" className="hidden h-8 sm:block" />

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#1A1A1A]">
                {user?.name ?? "Super Admin"}
              </p>
              {showUserId ? (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 mt-0.5 rounded px-1.5 py-0 text-[10px] font-semibold tracking-wide uppercase">
                  {roleLabel}
                </Badge>
              ) : (
                <p className="text-xs text-gray-400">{roleLabel}</p>
              )}
            </div>
            <Avatar size="lg" className="size-10">
              <AvatarImage
                src={user?.avatar}
                alt={user?.name ?? "Super Admin"}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </>
      )}
    </header>
  );
}
