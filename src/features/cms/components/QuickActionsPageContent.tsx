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
  type AdminQuickAction,
} from "@/services/cms-admin.service";
import { notify } from "@/utils/notify";

const EMPTY = {
  label: "",
  iconKey: "bulk",
  redirectType: "ROUTE",
  redirectId: "",
};

export function QuickActionsPageContent() {
  const [items, setItems] = useState<AdminQuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await cmsAdminService.listQuickActions());
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to load quick actions",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onCreate = async () => {
    if (!form.label || !form.redirectId) {
      notify.error("Label and deep link are required");
      return;
    }
    setSaving(true);
    try {
      await cmsAdminService.createQuickAction({
        ...form,
        displayOrder: items.length + 1,
        isVisible: true,
      });
      setOpen(false);
      setForm(EMPTY);
      await refresh();
      notify.success("Quick action added");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (item: AdminQuickAction) => {
    try {
      await cmsAdminService.updateQuickAction(item.id, {
        isVisible: !item.isVisible,
      });
      await refresh();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Failed to update");
    }
  };

  const remove = async (id: string) => {
    try {
      await cmsAdminService.removeQuickAction(id);
      await refresh();
      notify.success("Quick action removed");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quick Action Buttons"
        description="Control homepage shortcuts like Bulk Inquiry, WhatsApp, and Call."
        breadcrumbs={getNavBreadcrumbsFromPath(
          "/customer-app-cms/quick-actions",
        )}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Button
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border bg-white">
        {loading ? (
          <p className="text-muted-foreground p-6 text-sm">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Label</th>
                <th className="px-4 py-3 font-medium">Icon</th>
                <th className="px-4 py-3 font-medium">Deep Link</th>
                <th className="px-4 py-3 font-medium">Visible</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium">{item.label}</td>
                  <td className="text-muted-foreground px-4 py-3">
                    {item.iconKey || "—"}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {item.redirectId}
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={item.isVisible}
                      onCheckedChange={() => void toggle(item)}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void remove(item.id)}
                    >
                      <Trash2 className="text-destructive h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Quick Action</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            {(
              [
                ["label", "Label"],
                ["iconKey", "Icon Key (whatsapp, call, bulk…)"],
                ["redirectId", "Deep Link / Route"],
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
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
