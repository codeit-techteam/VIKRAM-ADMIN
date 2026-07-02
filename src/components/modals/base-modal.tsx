"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGlobalModalStore } from "@/store/modal-store";

interface BaseModalProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function BaseModal({
  title,
  description,
  children,
  footer,
}: BaseModalProps) {
  const { isOpen, close } = useGlobalModalStore();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
