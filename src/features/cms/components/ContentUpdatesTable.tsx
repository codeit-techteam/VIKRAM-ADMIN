"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { ContentUpdate } from "@/features/cms/types/cms.types";
import { buildFilteredUrl } from "@/utils/navigation-filters";

interface ContentUpdatesTableProps {
  updates: ContentUpdate[];
}

const columnHelper = createColumnHelper<ContentUpdate>();

const STATUS_FILTER_ROUTES: Record<string, string> = {
  Live: buildFilteredUrl(`${ROUTES.CUSTOMER_APP_CMS}/banners`, {
    status: "Live",
  }),
  Draft: buildFilteredUrl(`${ROUTES.CUSTOMER_APP_CMS}/catalog`, {
    status: "Draft",
  }),
  Expired: buildFilteredUrl(`${ROUTES.CUSTOMER_APP_CMS}/catalog`, {
    status: "Expired",
  }),
};

export function ContentUpdatesTable({ updates }: ContentUpdatesTableProps) {
  const router = useRouter();

  const columns = useMemo(
    () => [
      columnHelper.accessor("assetName", {
        header: "Asset",
        cell: (info) => {
          const row = info.row.original;

          return (
            <div className="flex items-center gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {row.thumbnailUrl ? (
                  <Image
                    src={row.thumbnailUrl}
                    alt={row.assetName}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-[#1A1A1A]">
                  {row.assetName}
                </p>
                <p className="truncate text-sm text-[#64748B]">
                  {row.subtitle}
                </p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => (
          <span className="text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          return (
            <StatusBadge
              status={status}
              filterHref={STATUS_FILTER_ROUTES[status]}
            />
          );
        },
      }),
      columnHelper.accessor("updatedBy", {
        header: "Updated By",
        cell: (info) => (
          <span className="text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("lastModified", {
        header: "Last Modified",
        cell: (info) => (
          <span className="text-[#64748B]">{info.getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 text-gray-400"
                  >
                    <MoreVertical className="size-4" />
                    <span className="sr-only">
                      Open menu for {row.original.assetName}
                    </span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    row.original.href && router.push(row.original.href)
                  }
                >
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }),
    ],
    [router],
  );

  const table = useReactTable({
    data: updates,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-[#1A1A1A]">
          Recent Content Updates
        </h2>
        <Link
          href={`${ROUTES.CUSTOMER_APP_CMS}/catalog`}
          className="text-primary text-sm font-medium hover:underline"
        >
          View All Updates
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-gray-100 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-medium tracking-wide text-gray-400 uppercase"
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
                className="cursor-pointer border-gray-100 hover:bg-gray-50/80"
                onClick={() =>
                  row.original.href && router.push(row.original.href)
                }
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
    </div>
  );
}
