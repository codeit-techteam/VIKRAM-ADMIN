"use client";

import { format } from "date-fns";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  Minus,
  Plus,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  WalletStatusBadge,
  WalletTypeBadge,
} from "@/features/wallet/components/WalletStatusBadge";
import type { CustomerWalletSummary } from "@/mock/mockWallet";
import { formatCurrency } from "@/utils/format-currency";
import { notify } from "@/utils/notify";

interface WalletDetailDrawerProps {
  wallet: CustomerWalletSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManualCredit?: (
    customerId: string,
    amount: number,
    notes: string,
  ) => Promise<void>;
  onManualDebit?: (
    customerId: string,
    amount: number,
    notes: string,
  ) => Promise<void>;
  isLoading?: boolean;
}

export function WalletDetailDrawer({
  wallet,
  open,
  onOpenChange,
  onManualCredit,
  onManualDebit,
  isLoading,
}: WalletDetailDrawerProps) {
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [showDebitForm, setShowDebitForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const resetForms = () => {
    setShowCreditForm(false);
    setShowDebitForm(false);
    setAmount("");
    setNotes("");
  };

  const handleCredit = async () => {
    if (!wallet || !onManualCredit) return;
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      notify.error("Invalid amount", "Please enter a valid amount.");
      return;
    }
    setActionLoading(true);
    try {
      await onManualCredit(wallet.customerId, parsed, notes);
      notify.success(
        "Credit added",
        `${formatCurrency(parsed)} credited to wallet.`,
      );
      resetForms();
    } catch {
      notify.error("Credit failed", "Unable to add credit.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDebit = async () => {
    if (!wallet || !onManualDebit) return;
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      notify.error("Invalid amount", "Please enter a valid amount.");
      return;
    }
    setActionLoading(true);
    try {
      await onManualDebit(wallet.customerId, parsed, notes);
      notify.success(
        "Debit processed",
        `${formatCurrency(parsed)} debited from wallet.`,
      );
      resetForms();
    } catch {
      notify.error("Debit failed", "Unable to process debit.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForms();
        onOpenChange(v);
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 space-y-0 border-b border-gray-100 px-6 py-5 pr-14 text-left">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : wallet ? (
            <>
              <SheetTitle className="flex items-center gap-2.5 text-xl font-bold text-[#1A1A1A]">
                <Wallet className="text-primary size-5" />
                {wallet.customerName}
              </SheetTitle>
              <SheetDescription className="mt-1.5 text-sm text-[#64748B]">
                {wallet.customerPhone}
              </SheetDescription>
              <p className="text-primary mt-2 text-2xl font-bold">
                {formatCurrency(wallet.balance)}
              </p>
            </>
          ) : null}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : wallet ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-100 bg-green-50 p-4">
                  <p className="text-xs text-green-700">Total Credited</p>
                  <p className="mt-1 text-sm font-bold text-green-800">
                    {formatCurrency(wallet.totalCredited)}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-red-50 p-4">
                  <p className="text-xs text-red-700">Total Debited</p>
                  <p className="mt-1 text-sm font-bold text-red-800">
                    {formatCurrency(wallet.totalDebited)}
                  </p>
                </div>
              </div>

              {(showCreditForm || showDebitForm) && (
                <div className="space-y-3 rounded-lg border border-gray-100 bg-[#F5F6F8] p-4">
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {showCreditForm ? "Manual Credit" : "Manual Debit"}
                  </p>
                  <div>
                    <Label htmlFor="wallet-amount">Amount (₹)</Label>
                    <Input
                      id="wallet-amount"
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wallet-notes">Notes</Label>
                    <Textarea
                      id="wallet-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Reason for adjustment"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      disabled={actionLoading}
                      onClick={showCreditForm ? handleCredit : handleDebit}
                    >
                      Confirm
                    </Button>
                    <Button size="sm" variant="outline" onClick={resetForms}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                  <History className="text-primary size-4" />
                  Wallet History
                </h4>
                <div className="space-y-2">
                  {wallet.transactions.slice(0, 8).map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                    >
                      <div className="flex items-center gap-2">
                        {txn.type === "CREDIT" ? (
                          <ArrowDownCircle className="size-4 text-green-600" />
                        ) : (
                          <ArrowUpCircle className="size-4 text-red-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">
                            {txn.reason.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            {format(new Date(txn.date), "dd MMM yyyy, HH:mm")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${txn.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}
                        >
                          {txn.type === "CREDIT" ? "+" : "-"}
                          {formatCurrency(txn.amount)}
                        </p>
                        <WalletStatusBadge status={txn.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {wallet.refunds.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-[#1A1A1A]">
                    Refund History
                  </h4>
                  <div className="space-y-2">
                    {wallet.refunds.map((refund) => (
                      <div
                        key={refund.id}
                        className="rounded-lg border border-gray-100 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-[#1A1A1A]">
                            {refund.orderNumber}
                          </p>
                          <WalletTypeBadge
                            type={
                              refund.status === "COMPLETED" ? "CREDIT" : "DEBIT"
                            }
                          />
                        </div>
                        <p className="mt-1 text-xs text-[#64748B]">
                          {refund.reason}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">
                          {formatCurrency(refund.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {wallet && !isLoading ? (
          <SheetFooter className="shrink-0 flex-row flex-wrap gap-2 border-t border-gray-100 bg-white px-6 py-4">
            {onManualCredit ? (
              <Button
                variant="outline"
                className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
                disabled={actionLoading}
                onClick={() => {
                  setShowDebitForm(false);
                  setShowCreditForm(true);
                }}
              >
                <Plus className="size-4" />
                Manual Credit
              </Button>
            ) : null}
            {onManualDebit ? (
              <Button
                variant="outline"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                disabled={actionLoading}
                onClick={() => {
                  setShowCreditForm(false);
                  setShowDebitForm(true);
                }}
              >
                <Minus className="size-4" />
                Manual Debit
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="ml-auto gap-2"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
              Close
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
