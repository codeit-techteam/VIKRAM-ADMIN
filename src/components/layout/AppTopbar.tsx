"use client";

import { Bell, Grid3x3, HelpCircle, Rss, Search, Shield } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROLE_LABELS } from "@/constants/roles";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface AppTopbarProps {
  sectionLabel?: string;
  pageLabel: string;
  showUserId?: boolean;
  variant?: "default" | "minimal";
}

export function AppTopbar({
  sectionLabel,
  pageLabel,
  showUserId = true,
  variant = "default",
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
        <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder={
            isMinimal
              ? "Search resources, logs, or assets..."
              : "Search orders, hubs, or stock..."
          }
          className="focus-visible:ring-primary/20 h-11 w-full rounded-full border-transparent bg-[#EEF4FF] pl-10 text-sm placeholder:text-gray-400 focus-visible:border-transparent"
        />
      </div>

      {isMinimal ? (
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="icon" className="size-9 text-gray-500">
            <Bell className="size-[18px]" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon" className="size-9 text-gray-500">
            <Grid3x3 className="size-[18px]" />
            <span className="sr-only">Apps</span>
          </Button>
          <span className="text-primary hidden text-sm font-semibold sm:inline">
            BuildQuick India
          </span>
        </div>
      ) : (
        <>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 text-gray-500"
            >
              <Rss className="size-[18px]" />
              <span className="sr-only">Feed</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden size-9 text-gray-500 sm:inline-flex"
            >
              <Shield className="size-[18px]" />
              <span className="sr-only">Security</span>
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
              <p className="text-xs text-gray-400">
                {showUserId
                  ? "BQ-HQ-001"
                  : user?.role
                    ? ROLE_LABELS[user.role]
                    : "Admin"}
              </p>
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
