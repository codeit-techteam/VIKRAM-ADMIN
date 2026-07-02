"use client";

import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { ROLE_LABELS } from "@/constants/roles";
import { useAuth } from "@/hooks/use-auth";
import { clearStoredTokens } from "@/store/auth-store";
import { authService } from "@/services/auth";

export function ProfileDropdown() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue with local logout even if API fails
    } finally {
      clearStoredTokens();
      logout();
      window.location.href = ROUTES.LOGIN;
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="relative size-9 rounded-full p-0">
            <Avatar className="size-9">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{user?.name ?? "User"}</p>
            <p className="text-muted-foreground text-xs">{user?.email}</p>
            {user?.role && (
              <p className="text-muted-foreground text-xs">
                {ROLE_LABELS[user.role]}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={ROUTES.SYSTEM_SETTINGS} />}>
          <User />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={ROUTES.SYSTEM_SETTINGS} />}>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} variant="destructive">
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
