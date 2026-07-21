export type WalletTransactionType = "CREDIT" | "DEBIT";
export type WalletTransactionStatus = "COMPLETED" | "PENDING" | "FAILED";
export type WalletTransactionReason =
  | "ORDER_REFUND"
  | "ORDER_PAYMENT"
  | "MANUAL_CREDIT"
  | "MANUAL_DEBIT"
  | "CANCELLATION_REFUND"
  | "PROMOTIONAL_CREDIT";

export interface WalletTransaction {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: WalletTransactionType;
  amount: number;
  reason: WalletTransactionReason;
  orderId?: string;
  orderNumber?: string;
  date: string;
  status: WalletTransactionStatus;
  notes?: string;
  processedBy?: string;
}

export interface WalletRefund {
  id: string;
  customerId: string;
  customerName: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  requestedDate: string;
  processedDate?: string;
  status: "PENDING" | "COMPLETED" | "REJECTED";
  reason: string;
}

export interface CustomerWalletSummary {
  customerId: string;
  customerName: string;
  customerPhone: string;
  balance: number;
  totalCredited: number;
  totalDebited: number;
  transactions: WalletTransaction[];
  refunds: WalletRefund[];
}

export interface WalletDashboardStats {
  totalWalletBalance: number;
  refundedAmount: number;
  pendingRefunds: number;
  transactionsToday: number;
}

export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "wt-001",
    customerId: "cust-001",
    customerName: "Ravi Teja Constructions",
    customerPhone: "+91 98765 43210",
    type: "CREDIT",
    amount: 15000,
    reason: "ORDER_REFUND",
    orderId: "ord-101",
    orderNumber: "BJW-2026-000142",
    date: "2026-07-21T09:30:00",
    status: "COMPLETED",
    notes: "Partial refund for cancelled cement order",
    processedBy: "Admin",
  },
  {
    id: "wt-002",
    customerId: "cust-002",
    customerName: "Skyline Infra Pvt Ltd",
    customerPhone: "+91 91234 56789",
    type: "DEBIT",
    amount: 8500,
    reason: "ORDER_PAYMENT",
    orderId: "ord-102",
    orderNumber: "BJW-2026-000158",
    date: "2026-07-21T11:15:00",
    status: "COMPLETED",
  },
  {
    id: "wt-003",
    customerId: "cust-003",
    customerName: "Metro Build Solutions",
    customerPhone: "+91 99887 76655",
    type: "CREDIT",
    amount: 5000,
    reason: "PROMOTIONAL_CREDIT",
    date: "2026-07-20T14:00:00",
    status: "COMPLETED",
    notes: "Loyalty bonus credit",
    processedBy: "System",
  },
  {
    id: "wt-004",
    customerId: "cust-004",
    customerName: "Greenfield Developers",
    customerPhone: "+91 97654 32109",
    type: "CREDIT",
    amount: 22000,
    reason: "CANCELLATION_REFUND",
    orderId: "ord-095",
    orderNumber: "BJW-2026-000095",
    date: "2026-07-20T16:45:00",
    status: "PENDING",
    notes: "Awaiting approval",
  },
  {
    id: "wt-005",
    customerId: "cust-005",
    customerName: "Apex Realty Group",
    customerPhone: "+91 96543 21098",
    type: "DEBIT",
    amount: 12000,
    reason: "ORDER_PAYMENT",
    orderId: "ord-110",
    orderNumber: "BJW-2026-000165",
    date: "2026-07-19T10:20:00",
    status: "COMPLETED",
  },
  {
    id: "wt-006",
    customerId: "cust-006",
    customerName: "Heritage Construction Co",
    customerPhone: "+91 95432 10987",
    type: "CREDIT",
    amount: 3000,
    reason: "MANUAL_CREDIT",
    date: "2026-07-19T13:00:00",
    status: "COMPLETED",
    notes: "Compensation for delivery delay",
    processedBy: "Priya Sharma",
  },
  {
    id: "wt-007",
    customerId: "cust-007",
    customerName: "Urban Edge Projects",
    customerPhone: "+91 94321 09876",
    type: "DEBIT",
    amount: 45000,
    reason: "ORDER_PAYMENT",
    orderId: "ord-088",
    orderNumber: "BJW-2026-000088",
    date: "2026-07-18T09:00:00",
    status: "COMPLETED",
  },
  {
    id: "wt-008",
    customerId: "cust-008",
    customerName: "Prime Contractors LLP",
    customerPhone: "+91 93210 98765",
    type: "CREDIT",
    amount: 7500,
    reason: "ORDER_REFUND",
    orderId: "ord-077",
    orderNumber: "BJW-2026-000077",
    date: "2026-07-18T15:30:00",
    status: "COMPLETED",
  },
  {
    id: "wt-009",
    customerId: "cust-009",
    customerName: "Nexus Buildtech",
    customerPhone: "+91 92109 87654",
    type: "DEBIT",
    amount: 2000,
    reason: "MANUAL_DEBIT",
    date: "2026-07-17T11:00:00",
    status: "COMPLETED",
    notes: "Adjustment for duplicate credit",
    processedBy: "Admin",
  },
  {
    id: "wt-010",
    customerId: "cust-010",
    customerName: "Shree Cement Works",
    customerPhone: "+91 91098 76543",
    type: "CREDIT",
    amount: 18000,
    reason: "ORDER_REFUND",
    orderId: "ord-120",
    orderNumber: "BJW-2026-000120",
    date: "2026-07-17T08:45:00",
    status: "PENDING",
  },
  {
    id: "wt-011",
    customerId: "cust-001",
    customerName: "Ravi Teja Constructions",
    customerPhone: "+91 98765 43210",
    type: "DEBIT",
    amount: 25000,
    reason: "ORDER_PAYMENT",
    orderId: "ord-130",
    orderNumber: "BJW-2026-000130",
    date: "2026-07-16T12:00:00",
    status: "COMPLETED",
  },
  {
    id: "wt-012",
    customerId: "cust-011",
    customerName: "Coastal Infra Ltd",
    customerPhone: "+91 90987 65432",
    type: "CREDIT",
    amount: 10000,
    reason: "PROMOTIONAL_CREDIT",
    date: "2026-07-15T10:00:00",
    status: "COMPLETED",
    processedBy: "System",
  },
];

export const MOCK_WALLET_REFUNDS: WalletRefund[] = [
  {
    id: "wr-001",
    customerId: "cust-004",
    customerName: "Greenfield Developers",
    orderId: "ord-095",
    orderNumber: "BJW-2026-000095",
    amount: 22000,
    requestedDate: "2026-07-20",
    status: "PENDING",
    reason: "Order cancelled before dispatch",
  },
  {
    id: "wr-002",
    customerId: "cust-010",
    customerName: "Shree Cement Works",
    orderId: "ord-120",
    orderNumber: "BJW-2026-000120",
    amount: 18000,
    requestedDate: "2026-07-17",
    status: "PENDING",
    reason: "Damaged goods received",
  },
  {
    id: "wr-003",
    customerId: "cust-001",
    customerName: "Ravi Teja Constructions",
    orderId: "ord-101",
    orderNumber: "BJW-2026-000142",
    amount: 15000,
    requestedDate: "2026-07-21",
    processedDate: "2026-07-21",
    status: "COMPLETED",
    reason: "Partial order cancellation",
  },
  {
    id: "wr-004",
    customerId: "cust-008",
    customerName: "Prime Contractors LLP",
    orderId: "ord-077",
    orderNumber: "BJW-2026-000077",
    amount: 7500,
    requestedDate: "2026-07-18",
    processedDate: "2026-07-18",
    status: "COMPLETED",
    reason: "Quality issue reported",
  },
];

export function computeWalletStats(
  transactions: WalletTransaction[],
  refunds: WalletRefund[],
): WalletDashboardStats {
  const today = new Date().toISOString().slice(0, 10);
  const todayTxns = transactions.filter((t) => t.date.startsWith(today));

  const customerBalances = new Map<string, number>();
  for (const txn of transactions) {
    const current = customerBalances.get(txn.customerId) ?? 0;
    const delta = txn.type === "CREDIT" ? txn.amount : -txn.amount;
    if (txn.status === "COMPLETED") {
      customerBalances.set(txn.customerId, current + delta);
    }
  }

  const totalBalance = Array.from(customerBalances.values()).reduce(
    (sum, b) => sum + Math.max(0, b),
    0,
  );

  const refunded = refunds
    .filter((r) => r.status === "COMPLETED")
    .reduce((sum, r) => sum + r.amount, 0);

  const pending = refunds
    .filter((r) => r.status === "PENDING")
    .reduce((sum, r) => sum + r.amount, 0);

  return {
    totalWalletBalance: totalBalance,
    refundedAmount: refunded,
    pendingRefunds: pending,
    transactionsToday: todayTxns.length,
  };
}

export function getCustomerWalletSummary(
  customerId: string,
): CustomerWalletSummary | null {
  const transactions = MOCK_WALLET_TRANSACTIONS.filter(
    (t) => t.customerId === customerId,
  );
  if (transactions.length === 0) return null;

  const first = transactions[0];
  let balance = 0;
  let credited = 0;
  let debited = 0;

  for (const txn of transactions) {
    if (txn.status !== "COMPLETED") continue;
    if (txn.type === "CREDIT") {
      balance += txn.amount;
      credited += txn.amount;
    } else {
      balance -= txn.amount;
      debited += txn.amount;
    }
  }

  return {
    customerId,
    customerName: first.customerName,
    customerPhone: first.customerPhone,
    balance: Math.max(0, balance),
    totalCredited: credited,
    totalDebited: debited,
    transactions,
    refunds: MOCK_WALLET_REFUNDS.filter((r) => r.customerId === customerId),
  };
}
