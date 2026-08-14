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
import {
  Copy,
  Eye,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import { useMemo } from "react";

import { SafeRemoteImage } from "@/components/shared/SafeRemoteImage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const AUDIENCE_LABEL: Record<string, string> = {
  ALL: "All customers",
  NEW_CUSTOMERS: "New customers",
  FREE_BIKE_REMAINING: "Free bike remaining",
  FREE_BIKE_EXHAUSTED: "Free bike used",
};

function formatCtaDestination(banner: Banner): string {
  const type = (banner.linkType || "ROUTE").toUpperCase();
  const target = banner.ctaPath?.trim() || "";

  if (type === "PRODUCT") return "Product page";
  if (type === "CATEGORY") return target ? `Category · ${target}` : "Category";
  if (type === "MEMBERSHIP") return "Loyalty";
  if (type === "BULK_INQUIRY") return "Bulk enquiry";
  if (type === "EXTERNAL") return "External URL";
  if (target === "/account/loyalty") return "Loyalty";
  if (target === "/(tabs)" || target === "/") return "Home";
  if (
    !target ||
    target === CATALOG_HOME_PATH ||
    target === "/(tabs)/catalog/" ||
    target === "/catalog"
  ) {
    return "Catalog";
  }
  return target;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function placementLabel(value: string): string {
  if (value === "HOME_PROMO") return "Home promo";
  if (value === "HOME_HERO") return "Home hero";
  return value.replaceAll("_", " ");
}

interface BannerPreviewTableProps {
  banners: Banner[];
  isLoading?: boolean;
  isReordering?: boolean;
  onEdit?: (banner: Banner) => void;
  onDelete?: (banner: Banner) => void;
  onPreview?: (banner: Banner) => void;
  onDuplicate?: (banner: Banner) => void;
  onToggleActive?: (banner: Banner) => void;
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
  onPreview,
  onDuplicate,
  onToggleActive,
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
          const src =
            row.mobileUrl ||
            row.imageUrl ||
            row.desktopUrl ||
            row.thumbnailUrl ||
            "";
          const hasRemoteImage =
            src.startsWith("http") ||
            src.startsWith("blob:") ||
            src.startsWith("data:");
          return (
            <div className="relative h-12 w-28 shrink-0 overflow-hidden rounded-md bg-[#F3F4F6]">
              {hasRemoteImage ? (
                <SafeRemoteImage
                  src={src}
                  alt={row.title}
                  fill
                  className={
                    row.location === "HOME_HERO"
                      ? "object-cover"
                      : "object-contain"
                  }
                  sizes="112px"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-1">
                  <p className="line-clamp-2 text-center text-[9px] text-[#94A3B8]">
                    No image
                  </p>
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("title", {
        header: "Title",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="min-w-0">
              <p className="font-medium text-[#1A1A1A]">{row.title}</p>
              <p className="text-sm text-[#64748B]">
                {row.name || row.subtitle || "—"}
              </p>
            </div>
          );
        },
      }),
      columnHelper.accessor("location", {
        header: "Placement",
        cell: (info) => (
          <span className="text-sm text-[#1A1A1A]">
            {placementLabel(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: "dates",
        header: "Schedule",
        cell: ({ row }) => (
          <div className="text-sm text-[#64748B]">
            <p>{formatDate(row.original.startsAt)}</p>
            <p>{formatDate(row.original.endsAt)}</p>
          </div>
        ),
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => (
          <span className="text-sm font-medium text-[#1A1A1A]">
            {info.getValue() || "—"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "audience",
        header: "Audience",
        cell: ({ row }) => (
          <span className="text-sm text-[#64748B]">
            {AUDIENCE_LABEL[row.original.targetAudience || "ALL"] ||
              row.original.targetAudience ||
              "All customers"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "updated",
        header: "Last updated",
        cell: ({ row }) => (
          <span className="text-sm text-[#64748B]">
            {formatDate(row.original.updatedAt)}
          </span>
        ),
      }),
      columnHelper.display({
        id: "cta",
        header: "Opens",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="text-sm text-[#64748B]">
              {formatCtaDestination(row.original)}
            </p>
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const banner = row.original;
          const isActive =
            banner.status === "ACTIVE" || banner.status === "SCHEDULED";
          return (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-8 text-gray-400 hover:text-gray-600"
                    >
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Actions for {banner.title}</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(banner)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPreview?.(banner)}>
                    <Eye className="size-4" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleActive?.(banner)}>
                    {isActive ? (
                      <PowerOff className="size-4" />
                    ) : (
                      <Power className="size-4" />
                    )}
                    {isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate?.(banner)}>
                    <Copy className="size-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(banner)}
                    className="text-red-600"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [onDelete, onDuplicate, onEdit, onPreview, onToggleActive],
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
