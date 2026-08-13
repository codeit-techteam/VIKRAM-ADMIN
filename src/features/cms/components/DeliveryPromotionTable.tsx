"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
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
import type { DeliveryPromotion } from "@/features/cms/types/delivery-promotion.types";
import { computeDeliveryPromotionLifecycle } from "@/features/cms/types/delivery-promotion.types";

const columnHelper = createColumnHelper<DeliveryPromotion>();

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface DeliveryPromotionTableProps {
  promotions: DeliveryPromotion[];
  onEdit: (row: DeliveryPromotion) => void;
  onPreview: (row: DeliveryPromotion) => void;
  onToggle: (row: DeliveryPromotion) => void;
  onDelete: (row: DeliveryPromotion) => void;
}

export function DeliveryPromotionTable({
  promotions,
  onEdit,
  onPreview,
  onToggle,
  onDelete,
}: DeliveryPromotionTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("bannerImage", {
        header: "Banner",
        cell: (info) => (
          <div className="relative h-12 w-28 overflow-hidden rounded-lg bg-[#FFCB05]">
            {info.getValue() ? (
              <SafeRemoteImage
                src={info.getValue()}
                alt={info.row.original.headline}
                fill
                className="object-contain"
                sizes="112px"
              />
            ) : null}
          </div>
        ),
      }),
      columnHelper.accessor("headline", {
        header: "Title",
        cell: (info) => (
          <div className="min-w-[180px]">
            <p className="font-semibold text-[#1A1A1A]">{info.getValue()}</p>
            <p className="text-xs text-[#64748B]">
              {info.row.original.name}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("placement", {
        header: "Placement",
        cell: () => (
          <span className="font-mono text-xs text-[#475569]">HOME_TOP</span>
        ),
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: (info) => {
          const status = computeDeliveryPromotionLifecycle(info.row.original);
          return <StatusBadge status={status} />;
        },
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => (
          <span className="text-sm font-medium text-[#1A1A1A]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("startsAt", {
        header: "Start",
        cell: (info) => (
          <span className="text-sm text-[#475569]">
            {formatDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("endsAt", {
        header: "End",
        cell: (info) => (
          <span className="text-sm text-[#475569]">
            {formatDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const row = info.row.original;
          const status = computeDeliveryPromotionLifecycle(row);
          const active = status === "ACTIVE" || status === "SCHEDULED";
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(row)}
                aria-label="Edit"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onPreview(row)}
                aria-label="Preview"
              >
                <Eye className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onToggle(row)}
                aria-label={active ? "Disable" : "Enable"}
              >
                {active ? (
                  <PowerOff className="size-4" />
                ) : (
                  <Power className="size-4" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(row)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPreview(row)}>
                    Preview on Customer App
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggle(row)}>
                    {active ? "Disable" : "Enable"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(row)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [onDelete, onEdit, onPreview, onToggle],
  );

  const table = useReactTable({
    data: promotions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              <TableHead key={header.id}>
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
      <TableBody>
        {table.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No delivery promotions yet.
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
