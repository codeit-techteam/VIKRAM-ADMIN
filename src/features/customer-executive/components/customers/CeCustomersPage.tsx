"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Eye,
  MoreHorizontal,
  Phone,
  ShoppingCart,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { CeCustomerAvatar } from "@/features/customer-executive/components/shared/CeCustomerAvatar";
import { CeMetricCard } from "@/features/customer-executive/components/shared/CeMetricCard";
import { CePageShell } from "@/features/customer-executive/components/shared/CePageShell";
import { CeSearchFilter } from "@/features/customer-executive/components/shared/CeSearchFilter";
import { CeStatusBadge } from "@/features/customer-executive/components/shared/CeStatusBadge";
import { CeTableSkeleton } from "@/features/customer-executive/components/shared/CeTableSkeleton";
import { useCeLoading } from "@/features/customer-executive/hooks/use-ce-loading";
import { CE_CITIES } from "@/features/customer-executive/mock/seed";
import {
  CE_PAGE_SIZE,
  EMPTY_CUSTOMER_FILTERS,
  type CeCustomer,
  type CeCustomerFilters,
} from "@/features/customer-executive/types";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import { formatCurrency } from "@/utils/format-currency";
import { notify } from "@/utils/notify";
import {
  initiateCall,
  openWhatsApp,
} from "@/features/customer-executive/utils/communication";
import { HighlightText } from "@/features/customer-executive/utils/highlight";
import { UserPlus } from "lucide-react";

const columnHelper = createColumnHelper<CeCustomer>();

type CustomerStatKey = "total" | "vip" | "activeThisMonth";

function isActiveThisMonth(customer: CeCustomer): boolean {
  if (!customer.lastOrderAt) return false;
  const d = new Date(customer.lastOrderAt);
  const now = new Date();
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
}

function getActiveStatKey(filters: CeCustomerFilters): CustomerStatKey | null {
  if (filters.activeThisMonth && filters.status === "ALL") {
    return "activeThisMonth";
  }
  if (filters.status === "VIP" && !filters.activeThisMonth) {
    return "vip";
  }
  if (
    filters.status === "ALL" &&
    !filters.activeThisMonth &&
    filters.city === "ALL" &&
    filters.customerType === "ALL" &&
    !filters.search
  ) {
    return "total";
  }
  return null;
}

function buildStatCardFilters(statId: CustomerStatKey): CeCustomerFilters {
  if (statId === "vip") {
    return { ...EMPTY_CUSTOMER_FILTERS, status: "VIP" };
  }
  if (statId === "activeThisMonth") {
    return { ...EMPTY_CUSTOMER_FILTERS, activeThisMonth: true };
  }
  return EMPTY_CUSTOMER_FILTERS;
}

export function CeCustomersPage() {
  const router = useRouter();
  const { isLoading } = useCeLoading();
  const queryCustomers = useCustomerExecutiveStore((s) => s.queryCustomers);
  const executives = useCustomerExecutiveStore((s) => s.executives);
  const assignExecutive = useCustomerExecutiveStore((s) => s.assignExecutive);
  const getCustomerPendingAmount = useCustomerExecutiveStore(
    (s) => s.getCustomerPendingAmount,
  );
  const customers = useCustomerExecutiveStore((s) => s.customers);

  const [draftFilters, setDraftFilters] = useState<CeCustomerFilters>(
    EMPTY_CUSTOMER_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<CeCustomerFilters>(
    EMPTY_CUSTOMER_FILTERS,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignTargetIds, setAssignTargetIds] = useState<string[]>([]);
  const [selectedExecutiveId, setSelectedExecutiveId] = useState("");
  const [sortBy, setSortBy] = useState<string>("lastOrderAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const queryResult = useMemo(
    () =>
      queryCustomers({
        page: currentPage,
        limit: CE_PAGE_SIZE,
        filters: appliedFilters,
        sortBy,
        sortDir,
      }),
    [queryCustomers, currentPage, appliedFilters, customers, sortBy, sortDir],
  );

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
  };

  const activeStatKey = getActiveStatKey(appliedFilters);

  const handleStatCardClick = useCallback(
    (statId: CustomerStatKey) => {
      const nextFilters =
        activeStatKey === statId && statId !== "total"
          ? EMPTY_CUSTOMER_FILTERS
          : buildStatCardFilters(statId);

      setDraftFilters(nextFilters);
      setAppliedFilters(nextFilters);
      setCurrentPage(1);
      setSelectedIds([]);
    },
    [activeStatKey],
  );

  const vipCount = useMemo(
    () => customers.filter((c) => c.status === "VIP").length,
    [customers],
  );

  const activeThisMonthCount = useMemo(
    () => customers.filter(isActiveThisMonth).length,
    [customers],
  );

  const handleAssign = () => {
    if (!selectedExecutiveId || assignTargetIds.length === 0) return;
    assignExecutive(assignTargetIds, selectedExecutiveId);
    const exec = executives.find((e) => e.id === selectedExecutiveId);
    notify.success(
      "Executive assigned",
      `${assignTargetIds.length} customer(s) assigned to ${exec?.name}`,
    );
    setAssignDialogOpen(false);
    setAssignTargetIds([]);
    setSelectedIds([]);
    setSelectedExecutiveId("");
  };

  const openAssignDialog = (ids: string[]) => {
    setAssignTargetIds(ids);
    setAssignDialogOpen(true);
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        ),
      }),
      columnHelper.accessor("name", {
        header: () => (
          <button
            type="button"
            className="hover:text-primary font-medium"
            onClick={() => toggleSort("name")}
          >
            Customer {sortBy === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
        ),
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex items-center gap-3">
              <CeCustomerAvatar name={c.name} id={c.id} />
              <div>
                <p className="font-medium">
                  <HighlightText text={c.name} query={appliedFilters.search} />
                </p>
                <p className="text-xs text-[#64748B]">{c.phone}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("company", {
        header: () => (
          <button
            type="button"
            className="hover:text-primary font-medium"
            onClick={() => toggleSort("company")}
          >
            Company{" "}
            {sortBy === "company" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
        ),
        cell: ({ getValue }) => (
          <HighlightText text={getValue()} query={appliedFilters.search} />
        ),
      }),
      columnHelper.accessor("city", { header: "City" }),
      columnHelper.display({
        id: "executive",
        header: "Assigned Executive",
        cell: ({ row }) => {
          const exec = executives.find(
            (e) => e.id === row.original.assignedExecutiveId,
          );
          return exec?.name ?? "—";
        },
      }),
      columnHelper.display({
        id: "lastOrder",
        header: "Last Order",
        cell: ({ row }) =>
          row.original.lastOrderAt
            ? new Date(row.original.lastOrderAt).toLocaleDateString("en-IN")
            : "—",
      }),
      columnHelper.display({
        id: "pending",
        header: "Pending Amount",
        cell: ({ row }) =>
          formatCurrency(getCustomerPendingAmount(row.original.id)),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => <CeStatusBadge status={getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const c = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `${ROUTES.CUSTOMER_EXECUTIVE}/customers/${c.id}`,
                    )
                  }
                >
                  <Eye className="size-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `${ROUTES.CUSTOMER_EXECUTIVE}/orders/new?customer=${c.id}`,
                    )
                  }
                >
                  <ShoppingCart className="size-4" />
                  Create Order
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => initiateCall(c.phone, c.name)}>
                  <Phone className="size-4" />
                  Call
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    openWhatsApp(
                      c.phone,
                      `Hi ${c.name}, this is BuildQuick India support.`,
                      c.name,
                    )
                  }
                >
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openAssignDialog([c.id])}>
                  <UserCog className="size-4" />
                  Assign Executive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [
      executives,
      getCustomerPendingAmount,
      router,
      sortBy,
      sortDir,
      appliedFilters.search,
    ],
  );

  const table = useReactTable({
    data: queryResult.items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(Object.fromEntries(selectedIds.map((id) => [id, true])))
          : updater;
      setSelectedIds(Object.keys(next).filter((k) => next[k]));
    },
    getRowId: (row) => row.id,
    state: {
      rowSelection: Object.fromEntries(selectedIds.map((id) => [id, true])),
    },
  });

  return (
    <CePageShell
      breadcrumbs={[
        { label: "Customer Executive", href: ROUTES.CUSTOMER_EXECUTIVE },
        { label: "Customer Management" },
      ]}
      title="Customer Management"
      subtitle="Manage and support your assigned B2B customers."
      actions={
        <Button
          render={<Link href={`${ROUTES.CUSTOMER_EXECUTIVE}/customers/new`} />}
        >
          <UserPlus className="size-4" />
          Register Customer
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <CeMetricCard
          label="Total Customers"
          value={customers.length}
          isLoading={isLoading}
          isActive={activeStatKey === "total"}
          onClick={() => handleStatCardClick("total")}
        />
        <CeMetricCard
          label="VIP Customers"
          value={vipCount}
          isLoading={isLoading}
          isActive={activeStatKey === "vip"}
          onClick={() => handleStatCardClick("vip")}
        />
        <CeMetricCard
          label="Active This Month"
          value={activeThisMonthCount}
          isLoading={isLoading}
          isActive={activeStatKey === "activeThisMonth"}
          onClick={() => handleStatCardClick("activeThisMonth")}
        />
      </div>

      <CeSearchFilter
        sticky
        search={draftFilters.search}
        onSearchChange={(v) => setDraftFilters((f) => ({ ...f, search: v }))}
        searchPlaceholder="Search customers, company, phone..."
        filters={[
          {
            key: "city",
            label: "City",
            value: draftFilters.city,
            onChange: (v) => setDraftFilters((f) => ({ ...f, city: v })),
            options: CE_CITIES.map((c) => ({
              label: c === "ALL" ? "All Cities" : c,
              value: c,
            })),
          },
          {
            key: "status",
            label: "Status",
            value: draftFilters.status,
            onChange: (v) =>
              setDraftFilters((f) => ({
                ...f,
                status: v as CeCustomerFilters["status"],
                activeThisMonth: false,
              })),
            options: [
              { label: "All Status", value: "ALL" },
              { label: "Active", value: "ACTIVE" },
              { label: "VIP", value: "VIP" },
              { label: "Inactive", value: "INACTIVE" },
            ],
          },
          {
            key: "type",
            label: "Type",
            value: draftFilters.customerType,
            onChange: (v) =>
              setDraftFilters((f) => ({
                ...f,
                customerType: v as CeCustomerFilters["customerType"],
              })),
            options: [
              { label: "All Types", value: "ALL" },
              { label: "Contractor", value: "CONTRACTOR" },
              { label: "Builder", value: "BUILDER" },
              { label: "Dealer", value: "DEALER" },
              { label: "Architect", value: "ARCHITECT" },
            ],
          },
        ]}
        onClear={() => {
          setDraftFilters(EMPTY_CUSTOMER_FILTERS);
          setAppliedFilters(EMPTY_CUSTOMER_FILTERS);
          setCurrentPage(1);
        }}
      />

      <div className="flex items-center justify-between">
        <Button size="sm" onClick={applyFilters}>
          Apply Filters
        </Button>
        {selectedIds.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => openAssignDialog(selectedIds)}
          >
            <UserCog className="size-4" />
            Assign Executive ({selectedIds.length})
          </Button>
        )}
      </div>

      {isLoading ? (
        <CeTableSkeleton columns={8} />
      ) : queryResult.items.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Try adjusting your filters or register a new customer."
        />
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="bg-orange-50/50 hover:bg-orange-50/50"
                >
                  {hg.headers.map((header) => (
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
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            currentPage={queryResult.page}
            totalPages={queryResult.totalPages}
            pageSize={CE_PAGE_SIZE}
            totalItems={queryResult.total}
            onPageChange={setCurrentPage}
            itemLabel="customers"
          />
        </div>
      )}

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Executive</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-3 text-sm text-[#64748B]">
              Select an executive for {assignTargetIds.length} customer(s)
            </p>
            <Select
              value={selectedExecutiveId}
              onValueChange={(v) => v && setSelectedExecutiveId(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select executive" />
              </SelectTrigger>
              <SelectContent>
                {executives.map((exec) => (
                  <SelectItem key={exec.id} value={exec.id}>
                    {exec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedExecutiveId}>
              Save Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CePageShell>
  );
}
