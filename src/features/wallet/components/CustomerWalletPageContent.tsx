"use client";

import { format } from "date-fns";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Download,
  Eye,
  IndianRupee,
  MoreHorizontal,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { WalletDetailDrawer } from "@/features/wallet/components/WalletDetailDrawer";
import {
  WalletStatusBadge,
  WalletTypeBadge,
} from "@/features/wallet/components/WalletStatusBadge";
import {
  EMPTY_WALLET_FILTERS,
  getWalletByCustomerId,
  getWalletStats,
  getWalletTransactions,
  manualCreditWallet,
  manualDebitWallet,
  WALLET_PAGE_SIZE,
  type WalletFilters,
} from "@/features/wallet/services/wallet.service";
import type { CustomerWalletSummary } from "@/mock/mockWallet";
import type {
  WalletDashboardStats,
  WalletTransaction,
} from "@/mock/mockWallet";
import { formatCurrency } from "@/utils/format-currency";
import { notify } from "@/utils/notify";

const REASON_LABELS: Record<string, string> = {
  ORDER_REFUND: "Order Refund",
  ORDER_PAYMENT: "Order Payment",
  MANUAL_CREDIT: "Manual Credit",
  MANUAL_DEBIT: "Manual Debit",
  CANCELLATION_REFUND: "Cancellation Refund",
  PROMOTIONAL_CREDIT: "Promotional Credit",
};

type WalletStatFilter = "all" | "refunded" | "pending_refunds" | "today";

export function CustomerWalletPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<WalletDashboardStats | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<WalletFilters>(EMPTY_WALLET_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [selectedWallet, setSelectedWallet] =
    useState<CustomerWalletSummary | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [activeStat, setActiveStat] = useState<WalletStatFilter | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, queryResult] = await Promise.all([
        getWalletStats(),
        getWalletTransactions({
          page: currentPage,
          limit: WALLET_PAGE_SIZE,
          filters,
        }),
      ]);
      setStats(statsData);
      setTransactions(queryResult.data);
      setTotal(queryResult.total);
      setTotalPages(queryResult.totalPages);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openDrawer = async (customerId: string) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const wallet = await getWalletByCustomerId(customerId);
      setSelectedWallet(wallet);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleManualCredit = async (
    customerId: string,
    amount: number,
    notes: string,
  ) => {
    await manualCreditWallet(customerId, amount, notes);
    const wallet = await getWalletByCustomerId(customerId);
    setSelectedWallet(wallet);
    await loadData();
  };

  const handleManualDebit = async (
    customerId: string,
    amount: number,
    notes: string,
  ) => {
    await manualDebitWallet(customerId, amount, notes);
    const wallet = await getWalletByCustomerId(customerId);
    setSelectedWallet(wallet);
    await loadData();
  };

  const breadcrumbs = useMemo(
    () => getNavBreadcrumbsFromPath("/finance-payments/customer-wallet"),
    [],
  );

  const handleStatClick = (stat: WalletStatFilter) => {
    if (activeStat === stat) {
      setActiveStat(null);
      setFilters(EMPTY_WALLET_FILTERS);
      setSearchInput("");
      setCurrentPage(1);
      return;
    }

    setActiveStat(stat);
    setCurrentPage(1);
    setSearchInput("");

    setFilters({
      ...EMPTY_WALLET_FILTERS,
      quickFilter: stat,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Wallet"
        subtitle="Manage wallet balances, refunds, and manual adjustments."
        breadcrumbs={breadcrumbs}
        actions={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              notify.success("Export started", "Wallet data exported to CSV.")
            }
          >
            <Download className="size-4" />
            Export
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Wallet Balance"
          value={stats ? formatCurrency(stats.totalWalletBalance) : "—"}
          subtext="Across all customers"
          icon={Wallet}
          iconContainerClassName="bg-orange-50"
          iconClassName="text-primary"
          isLoading={isLoading}
          isActive={activeStat === "all"}
          onClick={() => handleStatClick("all")}
        />
        <StatCard
          label="Refunded Amount"
          value={stats ? formatCurrency(stats.refundedAmount) : "—"}
          subtext="Completed refunds"
          icon={RefreshCw}
          iconContainerClassName="bg-green-50"
          iconClassName="text-green-600"
          isLoading={isLoading}
          isActive={activeStat === "refunded"}
          onClick={() => handleStatClick("refunded")}
        />
        <StatCard
          label="Pending Refunds"
          value={stats ? formatCurrency(stats.pendingRefunds) : "—"}
          subtext="Awaiting processing"
          icon={Clock}
          iconContainerClassName="bg-amber-50"
          iconClassName="text-amber-600"
          valueVariant="warning"
          isLoading={isLoading}
          isActive={activeStat === "pending_refunds"}
          onClick={() => handleStatClick("pending_refunds")}
        />
        <StatCard
          label="Transactions Today"
          value={stats?.transactionsToday ?? 0}
          subtext="Wallet activity today"
          icon={IndianRupee}
          iconContainerClassName="bg-blue-50"
          iconClassName="text-blue-600"
          isLoading={isLoading}
          isActive={activeStat === "today"}
          onClick={() => handleStatClick("today")}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by customer, phone, order..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setFilters((prev) => ({ ...prev, search: searchInput }));
                  setCurrentPage(1);
                }
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.type}
            onValueChange={(v) => {
              setActiveStat(null);
              setFilters((prev) => ({
                ...prev,
                type: v as WalletFilters["type"],
                quickFilter: "all",
              }));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CREDIT">Credit</SelectItem>
              <SelectItem value="DEBIT">Debit</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(v) => {
              setActiveStat(null);
              setFilters((prev) => ({
                ...prev,
                status: v as WalletFilters["status"],
                quickFilter: "all",
              }));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              setActiveStat(null);
              setFilters((prev) => ({
                ...prev,
                search: searchInput,
                quickFilter: "all",
              }));
              setCurrentPage(1);
            }}
          >
            Search
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F6F8] hover:bg-[#F5F6F8]">
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Customer
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Credit
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Debit
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Reason
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Order
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Date
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#64748B]">
                  Status
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#64748B]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <EmptyState
                      title="No transactions found"
                      description="Try adjusting your search or filters."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((txn) => (
                  <TableRow
                    key={txn.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => openDrawer(txn.customerId)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-[#1A1A1A]">
                          {txn.customerName}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {txn.customerPhone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {txn.type === "CREDIT" ? (
                        <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                          <ArrowDownCircle className="size-3.5" />
                          {formatCurrency(txn.amount)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {txn.type === "DEBIT" ? (
                        <span className="flex items-center gap-1 text-sm font-semibold text-red-600">
                          <ArrowUpCircle className="size-3.5" />
                          {formatCurrency(txn.amount)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <WalletTypeBadge type={txn.type} />
                      <p className="mt-0.5 text-xs text-[#64748B]">
                        {REASON_LABELS[txn.reason] ?? txn.reason}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {txn.orderNumber ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {format(new Date(txn.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <WalletStatusBadge status={txn.status} />
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                            onClick={() => openDrawer(txn.customerId)}
                          >
                            <Eye className="size-4" />
                            View Wallet
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={WALLET_PAGE_SIZE}
          totalItems={total}
          onPageChange={setCurrentPage}
          itemLabel="transactions"
        />
      </div>

      <WalletDetailDrawer
        wallet={selectedWallet}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onManualCredit={handleManualCredit}
        onManualDebit={handleManualDebit}
        isLoading={drawerLoading}
      />
    </div>
  );
}
