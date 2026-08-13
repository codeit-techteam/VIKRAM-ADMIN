"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { cn } from "@/lib/utils";
import {
  cmsAdminService,
  type AdminHomeSection,
} from "@/services/cms-admin.service";
import { notify } from "@/utils/notify";

/** Loyalty Progress and BajriPro/Membership are retired from Home. */
const HIDDEN_HOME_SECTIONS = new Set(["LOYALTY", "MEMBERSHIP"]);

function sectionHint(sectionType: string): string {
  switch (sectionType) {
    case "PROMO_BANNER":
      return " · Promotional Banners → Home Promo";
    case "FEATURED_PRODUCTS":
      return " · product rail: featured";
    case "RECENTLY_ADDED":
      return " · product rail: recently added";
    case "TOP_DEALS":
      return " · product rail: top deals";
    case "PRODUCT_DISCOVERY":
      return " · legacy (use Featured / Recently Added / Top Deals)";
    case "OFFER_FOR_YOU":
      return " · Offer Management carousel";
    default:
      return "";
  }
}

function SortableSectionRow({
  section,
  index,
  total,
  saving,
  editingTitleId,
  titleDraft,
  setTitleDraft,
  beginEditTitle,
  saveTitle,
  setEditingTitleId,
  move,
  toggle,
}: {
  section: AdminHomeSection;
  index: number;
  total: number;
  saving: boolean;
  editingTitleId: string | null;
  titleDraft: string;
  setTitleDraft: (value: string) => void;
  beginEditTitle: (section: AdminHomeSection) => void;
  saveTitle: (section: AdminHomeSection) => void;
  setEditingTitleId: (id: string | null) => void;
  move: (index: number, direction: -1 | 1) => void;
  toggle: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 bg-white px-4 py-3",
        isDragging && "z-10 rounded-lg shadow-lg ring-1 ring-orange-200",
      )}
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground cursor-grab touch-none active:cursor-grabbing"
        aria-label={`Drag to reorder ${section.title || section.sectionType}`}
        disabled={saving}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

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
          {sectionHint(section.sectionType)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={saving || index === 0}
          onClick={() => void move(index, -1)}
          aria-label="Move up"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={saving || index === total - 1}
          onClick={() => void move(index, 1)}
          aria-label="Move down"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Switch
          checked={section.enabled}
          onCheckedChange={() => void toggle(section.id)}
        />
      </div>
    </li>
  );
}

export function HomepageLayoutPageContent() {
  const [sections, setSections] = useState<AdminHomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cmsAdminService.listHomeSections();
      setSections(
        data
          .filter((s) => !HIDDEN_HOME_SECTIONS.has(s.sectionType))
          .sort((a, b) => a.displayOrder - b.displayOrder),
      );
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

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(sections, oldIndex, newIndex);
    setSections(next.map((s, i) => ({ ...s, displayOrder: i + 1 })));
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
        subtitle="Drag sections to reorder, or use arrows. Home Promo is managed under Promotional Banners. The top Delivery Promotion strip is managed separately under Delivery Promotion. Toggle Featured Products, Recently Added, and Top Deals individually."
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => void onDragEnd(event)}
          >
            <SortableContext
              items={sectionIds}
              strategy={verticalListSortingStrategy}
            >
              <ul className="divide-y">
                {sections.map((section, index) => (
                  <SortableSectionRow
                    key={section.id}
                    section={section}
                    index={index}
                    total={sections.length}
                    saving={saving}
                    editingTitleId={editingTitleId}
                    titleDraft={titleDraft}
                    setTitleDraft={setTitleDraft}
                    beginEditTitle={beginEditTitle}
                    saveTitle={saveTitle}
                    setEditingTitleId={setEditingTitleId}
                    move={move}
                    toggle={toggle}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
