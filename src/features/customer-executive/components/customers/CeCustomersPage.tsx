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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ROUTES } from "@/constants/routes";
import { CeCustomerAvatar } from "@/features/customer-executive/components/shared/CeCustomerAvatar";
import { CeMetricCard } from "@/features/customer-executive/components/shared/CeMetricCard";
import { CePageShell } from "@/features/customer-executive/components/shared/CePageShell";
import { CeSearchFilter } from "@/features/customer-executive/components/shared/CeSearchFilter";
import { CeStatusBadge } from "@/features/customer-executive/components/shared/CeStatusBadge";
import { CeTableSkeleton } from "@/features/customer-executive/components/shared/CeTableSkeleton";
import { CE_CITIES } from "@/features/customer-executive/constants/issue-types";
import {
  CE_PAGE_SIZE,
  EMPTY_CUSTOMER_FILTERS,
  type CeCustomer,
  type CeCustomerFilters,
} from "@/features/customer-executive/types";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import { formatCurrency } from "@/utils/format-currency";
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
  const loadCustomers = useCustomerExecutiveStore((s) => s.loadCustomers);
  const customersLoading = useCustomerExecutiveStore((s) => s.customersLoading);
  const customersError = useCustomerExecutiveStore((s) => s.customersError);
  const queryCustomers = useCustomerExecutiveStore((s) => s.queryCustomers);
  const customersMeta = useCustomerExecutiveStore((s) => s.customersMeta);
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
  const [sortBy, setSortBy] = useState<string>("lastOrderAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchCustomers = useCallback(() => {
    void loadCustomers({
      page: currentPage,
      limit: CE_PAGE_SIZE,
      filters: appliedFilters,
      sortBy,
      sortDir,
    });
  }, [loadCustomers, currentPage, appliedFilters, sortBy, sortDir]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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

  const totalCustomers = customersMeta?.total ?? customers.length;

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
        cell: () => "—",
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
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [getCustomerPendingAmount, router, sortBy, sortDir, appliedFilters.search],
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
          value={totalCustomers}
          isLoading={customersLoading}
          isActive={activeStatKey === "total"}
          onClick={() => handleStatCardClick("total")}
        />
        <CeMetricCard
          label="VIP Customers"
          value={vipCount}
          isLoading={customersLoading}
          isActive={activeStatKey === "vip"}
          onClick={() => handleStatCardClick("vip")}
        />
        <CeMetricCard
          label="Active This Month"
          value={activeThisMonthCount}
          isLoading={customersLoading}
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
      </div>

      {customersError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{customersError}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchCustomers}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {customersLoading ? (
        <CeTableSkeleton columns={8} />
      ) : queryResult.total === 0 ? (
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

    </CePageShell>
  );
}
