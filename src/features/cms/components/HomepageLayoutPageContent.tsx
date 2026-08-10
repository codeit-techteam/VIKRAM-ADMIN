"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import {
  cmsAdminService,
  type AdminHomeSection,
} from "@/services/cms-admin.service";
import { notify } from "@/utils/notify";

export function HomepageLayoutPageContent() {
  const [sections, setSections] = useState<AdminHomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cmsAdminService.listHomeSections();
      setSections(data.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to load layout",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persistOrder = async (next: AdminHomeSection[]) => {
    setSaving(true);
    try {
      const items = next.map((section, index) => ({
        id: section.id,
        displayOrder: index + 1,
      }));
      await cmsAdminService.reorderHomeSections(items);
      setSections(next.map((s, i) => ({ ...s, displayOrder: i + 1 })));
      notify.success("Homepage layout updated — customer app will refresh");
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to save layout",
      );
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    await persistOrder(next);
  };

  const toggle = async (id: string) => {
    try {
      await cmsAdminService.toggleHomeSection(id);
      await refresh();
      notify.success("Section visibility updated");
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to toggle section",
      );
    }
  };

  const beginEditTitle = (section: AdminHomeSection) => {
    setEditingTitleId(section.id);
    setTitleDraft(section.title ?? "");
  };

  const saveTitle = async (section: AdminHomeSection) => {
    const nextTitle = titleDraft.trim();
    if (nextTitle === (section.title ?? "").trim()) {
      setEditingTitleId(null);
      return;
    }
    setSaving(true);
    try {
      await cmsAdminService.updateHomeSection(section.id, {
        title: nextTitle,
      });
      setSections((prev) =>
        prev.map((s) =>
          s.id === section.id ? { ...s, title: nextTitle || null } : s,
        ),
      );
      notify.success("Section title updated");
      setEditingTitleId(null);
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to update title",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homepage Layout Manager"
        subtitle="Reorder and toggle sections to control the Customer App Home Screen. Edit titles where supported — changes appear after the next CMS fetch."
        breadcrumbs={getNavBreadcrumbsFromPath(
          "/customer-app-cms/homepage-layout",
        )}
      />

      <div className="rounded-xl border bg-white">
        {loading ? (
          <p className="text-muted-foreground p-6 text-sm">Loading layout…</p>
        ) : sections.length === 0 ? (
          <p className="text-muted-foreground p-6 text-sm">
            No home sections found. Run CMS seed on the backend.
          </p>
        ) : (
          <ul className="divide-y">
            {sections.map((section, index) => (
              <li
                key={section.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <GripVertical className="text-muted-foreground h-4 w-4" />
                <div className="min-w-0 flex-1">
                  {editingTitleId === section.id ? (
                    <Input
                      value={titleDraft}
                      autoFocus
                      disabled={saving}
                      className="h-8 text-sm"
                      onChange={(e) => setTitleDraft(e.target.value)}
                      onBlur={() => void saveTitle(section)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void saveTitle(section);
                        }
                        if (e.key === "Escape") {
                          setEditingTitleId(null);
                        }
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      className="truncate text-left text-sm font-medium hover:underline"
                      onClick={() => beginEditTitle(section)}
                    >
                      {section.title || section.sectionType}
                    </button>
                  )}
                  <p className="text-muted-foreground truncate text-xs">
                    {section.sectionType}
                    {section.layoutType ? ` · ${section.layoutType}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={saving || index === 0}
                    onClick={() => void move(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={saving || index === sections.length - 1}
                    onClick={() => void move(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Switch
                    checked={section.enabled}
                    onCheckedChange={() => void toggle(section.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
