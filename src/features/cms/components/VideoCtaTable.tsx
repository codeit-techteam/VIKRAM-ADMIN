"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ExternalLink, MousePointerClick, Pencil } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { SafeRemoteImage } from "@/components/shared/SafeRemoteImage";
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
import type { Video } from "@/features/cms/types/video.types";

interface VideoCtaTableProps {
  videos: Video[];
}

const columnHelper = createColumnHelper<Video>();

function getCtaAppStatus(video: Video): "ACTIVE" | "INACTIVE" {
  return video.liveOnApp ? "ACTIVE" : "INACTIVE";
}

const DESTINATION_LABELS: Record<Video["cta"]["destinationType"], string> = {
  category: "Category",
  product: "Product",
  offer: "Offer",
  external: "External",
};

export function VideoCtaTable({ videos }: VideoCtaTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Video",
        cell: (info) => {
          const row = info.row.original;

          return (
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                <SafeRemoteImage
                  src={row.thumbnailUrl}
                  alt={row.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-[#1A1A1A]">
                  {row.title}
                </p>
                <p className="text-sm text-[#64748B]">{row.duration}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("tags", {
        header: "App Placement",
        cell: (info) => (
          <div className="flex flex-wrap gap-1">
            {info.getValue().map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-[#64748B]"
              >
                {tag}
              </span>
            ))}
          </div>
        ),
      }),
      columnHelper.display({
        id: "cta",
        header: "CTA Button",
        cell: ({ row }) => {
          const { cta } = row.original;

          if (!cta.enabled) {
            return (
              <span className="text-sm text-[#64748B] italic">
                CTA disabled
              </span>
            );
          }

          return (
            <div className="min-w-0">
              <p className="text-primary inline-flex items-center gap-1.5 text-sm font-medium">
                <MousePointerClick className="size-3.5 shrink-0" />
                {cta.label}
              </p>
              <p className="mt-0.5 text-sm text-[#64748B]">{cta.path}</p>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "destination",
        header: "Destination",
        cell: ({ row }) => (
          <span className="text-sm text-[#64748B]">
            {DESTINATION_LABELS[row.original.cta.destinationType]}
          </span>
        ),
      }),
      columnHelper.display({
        id: "appStatus",
        header: "On Customer App",
        cell: ({ row }) => (
          <StatusBadge status={getCtaAppStatus(row.original)} />
        ),
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
              render={
                <Link
                  href={`/customer-app-cms/videos/upload?edit=${row.original.id}`}
                />
              }
            >
              <Pencil className="size-4" />
              <span className="sr-only">Edit CTA for {row.original.title}</span>
            </Button>
            {row.original.videoUrl ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 text-gray-400 hover:text-gray-600"
                render={
                  <a
                    href={row.original.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <ExternalLink className="size-4" />
                <span className="sr-only">
                  Preview video for {row.original.title}
                </span>
              </Button>
            ) : null}
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: videos,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
            <TableRow key={row.id} className="border-b border-gray-100">
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
