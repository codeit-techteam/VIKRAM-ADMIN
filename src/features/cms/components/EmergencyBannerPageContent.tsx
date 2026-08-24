"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import {
  cmsAdminService,
  type AdminPromotionalCard,
} from "@/services/cms-admin.service";
import { notify } from "@/utils/notify";

const EMPTY = {
  title: "",
  subtitle: "",
  imageUrl: "",
  buttonText: "Learn More",
  redirectId: "",
  startsAt: "",
  endsAt: "",
};

export function EmergencyBannerPageContent() {
  const [items, setItems] = useState<AdminPromotionalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await cmsAdminService.listPromotionalCards("EMERGENCY_BANNER"));
    } catch (error) {
      notify.error(
        error instanceof Error
          ? error.message
          : "Failed to load emergency banners",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onCreate = async () => {
    if (!form.title) {
      notify.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const created = await cmsAdminService.createPromotionalCard({
        ...form,
        cardType: "EMERGENCY_BANNER",
        redirectType: "ROUTE",
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
        isActive: true,
      });
      await cmsAdminService.activatePromotionalCard(created.id);
      setOpen(false);
      setForm(EMPTY);
      await refresh();
      notify.success("Emergency banner published");
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to publish",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (card: AdminPromotionalCard) => {
    try {
      if (card.isActive)
        await cmsAdminService.deactivatePromotionalCard(card.id);
      else await cmsAdminService.activatePromotionalCard(card.id);
      await refresh();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Failed to update");
    }
  };

  const remove = async (id: string) => {
    try {
      await cmsAdminService.removePromotionalCard(id);
      await refresh();
      notify.success("Banner removed");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Banner"
        description="Instantly publish flash sale, weather alert, maintenance, or free delivery strips above the hero."
        breadcrumbs={getNavBreadcrumbsFromPath(
          "/customer-app-cms/emergency-banner",
        )}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Publish Banner
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border bg-white">
        {loading ? (
          <p className="text-muted-foreground p-6 text-sm">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground p-6 text-sm">
            No emergency banners. Publish one to show above the hero carousel.
          </p>
        ) : (
          <ul className="divide-y">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground truncate text-sm">
                    {item.subtitle || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.isActive}
                    onCheckedChange={() => void toggle(item)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void remove(item.id)}
                  >
                    <Trash2 className="text-destructive h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Emergency Banner</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            {(
              [
                ["title", "Title"],
                ["subtitle", "Message"],
                ["imageUrl", "Image URL (optional)"],
                ["redirectId", "Deep Link (optional)"],
                ["startsAt", "Start ISO date"],
                ["endsAt", "End ISO date"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="grid gap-1.5">
                <Label>{label}</Label>
                <Input
                  value={form[key]}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={() => void onCreate()}>
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
