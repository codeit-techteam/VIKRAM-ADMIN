"use client";

import { Calendar } from "lucide-react";

import { EnterpriseGlobalSearch } from "@/components/layout/global-search";
import { NotificationBell } from "@/features/notification-center";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

  const displayName = user?.name ?? "Super Admin";
  const roleLabel = user?.role ? ROLE_LABELS[user.role] : "Super Admin";
  const showRoleBadge =
    showUserId && roleLabel.toLowerCase() !== displayName.toLowerCase();

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
          isMinimal ? "max-w-none" : "max-w-2xl",
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
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <NotificationBell />
          <span className="text-primary hidden text-sm font-semibold sm:inline">
            Bajriwala
          </span>
        </div>
      ) : (
        <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
          <div className="hidden items-center gap-2 text-sm text-[#64748B] md:flex">
            <Calendar className="size-4 text-gray-400" aria-hidden="true" />
            <span>{formatTopbarDate(new Date())}</span>
          </div>

          <NotificationBell />

          <Separator orientation="vertical" className="hidden h-8 sm:block" />

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-tight font-semibold text-[#1A1A1A]">
                {displayName}
              </p>
              {showRoleBadge ? (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 mt-0.5 rounded px-1.5 py-0 text-[10px] font-semibold tracking-wide uppercase">
                  {roleLabel}
                </Badge>
              ) : !showUserId ? (
                <p className="text-xs text-gray-400">{roleLabel}</p>
              ) : null}
            </div>
            <Avatar size="lg" className="size-10 shrink-0">
              <AvatarImage src={user?.avatar} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      )}
    </header>
  );
}
