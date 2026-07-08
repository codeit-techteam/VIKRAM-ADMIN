"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { CreateHubResult } from "@/types/hub-onboarding.types";
import { Building2, LayoutDashboard, Plus, Rocket } from "lucide-react";
import Link from "next/link";

interface HubCreateSuccessModalProps {
  open: boolean;
  result: CreateHubResult | null;
  onCreateAnother: () => void;
}

export function HubCreateSuccessModal({
  open,
  result,
  onCreateAnother,
}: HubCreateSuccessModalProps) {
  if (!result) return null;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-orange-50">
            <Rocket className="text-primary size-7" />
          </div>
          <DialogTitle className="text-xl">
            Hub Successfully Created
          </DialogTitle>
          <DialogDescription className="text-center">
            <span className="font-semibold text-[#1A1A1A]">
              {result.hubName}
            </span>{" "}
            ({result.hubCode}) is live across Sub-Hub Network, inventory,
            logistics, and dashboard KPIs.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="h-11 w-full gap-2"
            render={<Link href={`${ROUTES.SUB_HUB_NETWORK}/${result.hubId}`} />}
          >
            <Building2 className="size-4" />
            Go To Hub
          </Button>
          <Button
            variant="outline"
            className="h-11 w-full gap-2"
            render={<Link href={ROUTES.SUB_HUB_NETWORK} />}
          >
            <LayoutDashboard className="size-4" />
            Go To Dashboard
          </Button>
          <Button
            variant="ghost"
            className="h-11 w-full gap-2"
            onClick={onCreateAnother}
          >
            <Plus className="size-4" />
            Create Another
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
