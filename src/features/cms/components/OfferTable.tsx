"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Copy,
  Eye,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

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
import {
  formatOfferDate,
  OFFER_TYPE_LABELS,
  OFFER_VISIBILITY_LABELS,
} from "@/features/cms/constants/offer.mock";
import type { Offer } from "@/features/cms/types/offer.types";

interface OfferTableProps {
  offers: Offer[];
  onPublish: (offer: Offer) => void;
  onUnpublish: (offer: Offer) => void;
  onDuplicate: (offer: Offer) => void;
  onDelete: (offer: Offer) => void;
}

const columnHelper = createColumnHelper<Offer>();

export function OfferTable({
  offers,
  onPublish,
  onUnpublish,
  onDuplicate,
  onDelete,
}: OfferTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "banner",
        header: "Banner",
        cell: ({ row }) => (
          <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
            <Image
              src={row.original.mobileBanner}
              alt={row.original.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Offer Name",
        cell: (info) => {
          const offer = info.row.original;
          return (
            <div className="min-w-[160px]">
              <p className="font-semibold text-[#1A1A1A]">{offer.name}</p>
              <p className="text-xs text-[#64748B]">/{offer.slug}</p>
            </div>
          );
        },
      }),
      columnHelper.accessor("offerType", {
        header: "Offer Type",
        cell: (info) => (
          <span className="text-sm text-[#64748B]">
            {OFFER_TYPE_LABELS[info.getValue()]}
          </span>
        ),
      }),
      columnHelper.display({
        id: "productsCount",
        header: "Products",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-[#1A1A1A]">
            {row.original.products.length}
          </span>
        ),
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => (
          <span className="bg-primary/10 text-primary inline-flex size-7 items-center justify-center rounded-full text-xs font-bold">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("visibility", {
        header: "Visibility",
        cell: (info) => (
          <span className="text-sm text-[#64748B]">
            {OFFER_VISIBILITY_LABELS[info.getValue()]}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("startDate", {
        header: "Start Date",
        cell: (info) => (
          <span className="text-sm text-[#64748B]">
            {formatOfferDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("endDate", {
        header: "End Date",
        cell: (info) => (
          <span className="text-sm text-[#64748B]">
            {formatOfferDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const offer = row.original;
          const isPublished = offer.status === "ACTIVE";

          return (
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 text-gray-400 hover:text-[#1A1A1A]"
                render={
                  <Link href={`/customer-app-cms/offers/${offer.id}/edit`} />
                }
              >
                <Pencil className="size-4" />
                <span className="sr-only">Edit {offer.name}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 text-gray-400 hover:text-[#1A1A1A]"
                render={
                  <Link href={`/customer-app-cms/offers/${offer.id}/preview`} />
                }
              >
                <Eye className="size-4" />
                <span className="sr-only">Preview {offer.name}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-8 text-gray-400 hover:text-[#1A1A1A]"
                    >
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">More actions</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => onDuplicate(offer)}>
                    <Copy className="size-4" />
                    Duplicate
                  </DropdownMenuItem>
                  {isPublished ? (
                    <DropdownMenuItem onClick={() => onUnpublish(offer)}>
                      <Undo2 className="size-4" />
                      Unpublish
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onPublish(offer)}>
                      <Send className="size-4" />
                      Publish
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(offer)}
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
    [onDelete, onDuplicate, onPublish, onUnpublish],
  );

  const table = useReactTable({
    data: offers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (offers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 px-6 py-16 text-center">
        <p className="text-base font-semibold text-[#1A1A1A]">
          No offers found
        </p>
        <p className="mt-1 text-sm text-[#64748B]">
          Try adjusting filters or create a new offer.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-gray-100 bg-gray-50 hover:bg-gray-50"
            >
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
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
