"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
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
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CATALOG_HOME_PATH } from "@/features/cms/schema/banner-form.schema";
import type { Banner } from "@/features/cms/types/banner.types";
import { cn } from "@/lib/utils";

function formatCtaDestination(banner: Banner): string {
  const type = (banner.linkType || "ROUTE").toUpperCase();
  const target = banner.ctaPath?.trim() || "";

  if (type === "PRODUCT") return "Product page";
  if (type === "CATEGORY") return target ? `Category · ${target}` : "Category";
  if (
    !target ||
    target === CATALOG_HOME_PATH ||
    target === "/(tabs)/catalog/" ||
    target === "/catalog"
  ) {
    return "Catalog home";
  }
  return target;
}

interface BannerPreviewTableProps {
  banners: Banner[];
  isLoading?: boolean;
  isReordering?: boolean;
  onEdit?: (banner: Banner) => void;
  onDelete?: (banner: Banner) => void;
  /** Called with the new order of the currently displayed rows */
  onReorder?: (next: Banner[]) => void;
}

const columnHelper = createColumnHelper<Banner>();

function SortableBannerRow({
  banner,
  children,
  disabled,
}: {
  banner: Banner;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id, disabled });

  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "border-b border-gray-100",
        isDragging && "relative z-10 bg-white shadow-md",
      )}
      data-dragging={isDragging ? "true" : undefined}
    >
      <TableCell className="w-10 py-4">
        <button
          type="button"
          className="cursor-grab touch-none text-gray-300 hover:text-gray-500 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Drag to reorder ${banner.title}`}
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </TableCell>
      {children}
    </TableRow>
  );
}

export function BannerPreviewTable({
  banners,
  isLoading = false,
  isReordering = false,
  onEdit,
  onDelete,
  onReorder,
}: BannerPreviewTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const bannerIds = useMemo(() => banners.map((b) => b.id), [banners]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("thumbnailUrl", {
        header: "Preview",
        cell: (info) => {
          const row = info.row.original;

          return (
            <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
              <Image
                src={row.thumbnailUrl}
                alt={row.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          );
        },
      }),
      columnHelper.accessor("title", {
        header: "Campaign Title",
        cell: (info) => {
          const row = info.row.original;

          return (
            <div className="min-w-0">
              <p className="font-medium text-[#1A1A1A]">{row.title}</p>
              <p className="text-sm text-[#64748B]">{row.location}</p>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "cta",
        header: "CTA / Redirect",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="text-primary text-sm font-medium">
              {row.original.ctaLabel}
            </p>
            <p className="text-sm text-[#64748B]">
              {formatCtaDestination(row.original)}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 text-gray-400 hover:text-gray-600"
              onClick={() => onEdit?.(row.original)}
            >
              <Pencil className="size-4" />
              <span className="sr-only">Edit {row.original.title}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 text-red-400 hover:text-red-600"
              onClick={() => onDelete?.(row.original)}
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Delete {row.original.title}</span>
            </Button>
          </div>
        ),
      }),
    ],
    [onDelete, onEdit],
  );

  const table = useReactTable({
    data: banners,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;

    const oldIndex = banners.findIndex((b) => b.id === active.id);
    const newIndex = banners.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onReorder(arrayMove(banners, oldIndex, newIndex));
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-[#64748B]">
        Loading banners...
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-[#64748B]">
        No banners match your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-gray-100 bg-gray-50 hover:bg-gray-50"
              >
                <TableHead className="w-10 text-xs font-medium tracking-wide text-gray-500 uppercase" />
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-medium tracking-wide text-gray-500 uppercase"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <SortableContext
            items={bannerIds}
            strategy={verticalListSortingStrategy}
          >
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <SortableBannerRow
                  key={row.id}
                  banner={row.original}
                  disabled={isReordering || !onReorder}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </SortableBannerRow>
              ))}
            </TableBody>
          </SortableContext>
        </Table>
      </DndContext>
    </div>
  );
}
