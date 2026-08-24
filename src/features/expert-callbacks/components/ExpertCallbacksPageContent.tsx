"use client";

import { format } from "date-fns";
import {
  CheckCircle2,
  Headphones,
  Loader2,
  MessageCircle,
  Phone,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { ROUTES } from "@/constants/routes";
import {
  getExpertCallbacks,
  updateExpertCallbackStatus,
} from "@/features/expert-callbacks/services/expert-callbacks.service";
import {
  EXPERT_CALLBACK_PAGE_SIZE,
  EXPERT_CALLBACK_STATUS_LABELS,
  type ExpertCallbackRequest,
  type ExpertCallbackStats,
  type ExpertCallbackStatus,
} from "@/features/expert-callbacks/types";
import { getApiErrorMessage } from "@/services/api";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

function phoneHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `tel:+${digits.startsWith("91") ? digits : `91${digits}`}`;
}

function statusClass(status: ExpertCallbackStatus): string {
  switch (status) {
    case "NEW":
      return "bg-blue-100 text-blue-700";
    case "CONTACTED":
      return "bg-amber-100 text-amber-800";
    case "CLOSED":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function ExpertCallbacksPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<ExpertCallbackRequest[]>([]);
  const [stats, setStats] = useState<ExpertCallbackStats | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ExpertCallbackStatus | "all">("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ExpertCallbackRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const result = await getExpertCallbacks({
        page: currentPage,
        limit: EXPERT_CALLBACK_PAGE_SIZE,
        q: search,
        status,
      });
      setRows(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setStats(result.stats);
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, status]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const openRow = (row: ExpertCallbackRequest) => {
    setSelected(row);
    setNotes(row.executiveNotes ?? "");
    setDrawerOpen(true);
  };

  const saveUpdate = async (nextStatus?: ExpertCallbackStatus) => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await updateExpertCallbackStatus(selected.id, {
        status: nextStatus ?? selected.status,
        executiveNotes: notes,
      });
      setSelected(updated);
      notify.success("Callback updated");
      await loadData();
    } catch (error) {
      notify.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expert Callbacks"
        subtitle="Talk to Expert requests from the customer app — name and needs for follow-up."
        breadcrumbs={getNavBreadcrumbsFromPath(
          ROUTES.CUSTOMER_EXECUTIVE_EXPERT_CALLBACKS,
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total"
          value={stats?.total ?? 0}
          icon={Headphones}
          isLoading={isLoading}
        />
        <StatCard
          label="New"
          value={stats?.new ?? 0}
          icon={MessageCircle}
          isLoading={isLoading}
        />
        <StatCard
          label="Contacted"
          value={stats?.contacted ?? 0}
          icon={Phone}
          isLoading={isLoading}
        />
        <StatCard
          label="Closed"
          value={stats?.closed ?? 0}
          icon={CheckCircle2}
          isLoading={isLoading}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name, phone, or needs…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select
          value={status}
          onValueChange={(value: string) => {
            setCurrentPage(1);
            setStatus(value as ExpertCallbackStatus | "all");
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="CONTACTED">Contacted</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading callbacks…
          </div>
        ) : loadError ? (
          <div className="space-y-3 p-6">
            <EmptyState
              title="Could not load callbacks"
              description={loadError}
            />
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => void loadData()}>
                Retry
              </Button>
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No expert callbacks yet"
              description="When customers submit Talk to Expert from the app, requests appear here with their name and needs."
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Needs</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const phone = row.phoneSnapshot || row.customer.phone;
                  return (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() => openRow(row)}
                    >
                      <TableCell className="font-medium">
                        {row.contactName}
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate text-muted-foreground">
                        {row.needs}
                      </TableCell>
                      <TableCell>{phone || "—"}</TableCell>
                      <TableCell>
                        {row.categoryName || row.categorySlug || "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                            statusClass(row.status),
                          )}
                        >
                          {EXPERT_CALLBACK_STATUS_LABELS[row.status]}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {row.createdAt
                          ? format(new Date(row.createdAt), "dd MMM, hh:mm a")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="border-t px-4 py-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={total}
                pageSize={EXPERT_CALLBACK_PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.contactName}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Needs
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                    {selected.needs}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Phone
                    </p>
                    <p className="mt-1">
                      {selected.phoneSnapshot || selected.customer.phone || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Category
                    </p>
                    <p className="mt-1">
                      {selected.categoryName || selected.categorySlug || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Status
                    </p>
                    <p className="mt-1">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                          statusClass(selected.status),
                        )}
                      >
                        {EXPERT_CALLBACK_STATUS_LABELS[selected.status]}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Submitted
                    </p>
                    <p className="mt-1">
                      {selected.createdAt
                        ? format(
                            new Date(selected.createdAt),
                            "dd MMM yyyy, hh:mm a",
                          )
                        : "—"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                    Executive notes
                  </p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add call notes…"
                    rows={4}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {(selected.phoneSnapshot || selected.customer.phone) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const href = phoneHref(
                          selected.phoneSnapshot || selected.customer.phone,
                        );
                        if (href) window.location.href = href;
                      }}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    disabled={saving || selected.status === "CONTACTED"}
                    onClick={() => void saveUpdate("CONTACTED")}
                  >
                    Mark Contacted
                  </Button>
                  <Button
                    variant="outline"
                    disabled={saving || selected.status === "CLOSED"}
                    onClick={() => void saveUpdate("CLOSED")}
                  >
                    Mark Closed
                  </Button>
                  <Button disabled={saving} onClick={() => void saveUpdate()}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save notes"
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
