"use client";

import {
  ClipboardCheck,
  CreditCard,
  Building2,
  FileCheck,
  Package,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { NAV_FILTER_PRESETS } from "@/constants/navigation-filters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const APPROVAL_TABS = [
  {
    id: "transfers",
    label: "Transfer Requests",
    href: NAV_FILTER_PRESETS.transfersWaitingHubAcceptance(),
    count: 8,
    icon: Truck,
  },
  {
    id: "customers",
    label: "Customer Approvals",
    href: NAV_FILTER_PRESETS.customersByStatus("PENDING_VERIFICATION"),
    count: 14,
    icon: Users,
  },
  {
    id: "payments",
    label: "Payment Approvals",
    href: NAV_FILTER_PRESETS.paymentsPending(),
    count: 12,
    icon: CreditCard,
  },
  {
    id: "warehouse",
    label: "Warehouse Requests",
    href: NAV_FILTER_PRESETS.warehouseRequisitions(),
    count: 15,
    icon: Package,
  },
  {
    id: "hub",
    label: "Hub Requests",
    href: NAV_FILTER_PRESETS.hubRequisitions(),
    count: 9,
    icon: Building2,
  },
  {
    id: "executives",
    label: "Executive Approvals",
    href: NAV_FILTER_PRESETS.executivesPending(),
    count: 6,
    icon: UserCheck,
  },
  {
    id: "kyc",
    label: "KYC Approvals",
    href: NAV_FILTER_PRESETS.customersKycPending(),
    count: 11,
    icon: FileCheck,
  },
] as const;

const MOCK_QUEUE = [
  {
    id: "1",
    reference: "TRF-2041",
    entity: "Gurgaon North Hub",
    type: "Transfer Request",
    submitted: "2h ago",
    priority: "High",
    tab: "transfers",
    href: NAV_FILTER_PRESETS.transfersWaitingHubAcceptance(),
  },
  {
    id: "2",
    reference: "CUST-8821",
    entity: "Metro Infra Ltd.",
    type: "Customer Approval",
    submitted: "4h ago",
    priority: "Medium",
    tab: "customers",
    href: NAV_FILTER_PRESETS.customersByStatus("PENDING_VERIFICATION"),
  },
  {
    id: "3",
    reference: "PAY-3392",
    entity: "Ravi Teja Const.",
    type: "Payment Approval",
    submitted: "5h ago",
    priority: "High",
    tab: "payments",
    href: NAV_FILTER_PRESETS.paymentsPending(),
  },
  {
    id: "4",
    reference: "REQ-1182",
    entity: "Noida Central Warehouse",
    type: "Warehouse Request",
    submitted: "6h ago",
    priority: "Medium",
    tab: "warehouse",
    href: NAV_FILTER_PRESETS.warehouseRequisitions(),
  },
  {
    id: "5",
    reference: "HUB-442",
    entity: "Jaipur West Hub",
    type: "Hub Request",
    submitted: "8h ago",
    priority: "Low",
    tab: "hub",
    href: NAV_FILTER_PRESETS.hubRequisitions(),
  },
  {
    id: "6",
    reference: "EXE-119",
    entity: "Kavita Nair",
    type: "Executive Approval",
    submitted: "1d ago",
    priority: "Medium",
    tab: "executives",
    href: NAV_FILTER_PRESETS.executivesPending(),
  },
  {
    id: "7",
    reference: "KYC-771",
    entity: "Horizon Realty",
    type: "KYC Approval",
    submitted: "1d ago",
    priority: "High",
    tab: "kyc",
    href: NAV_FILTER_PRESETS.customersKycPending(),
  },
];

export function ApprovalsCenterPage() {
  const router = useRouter();
  const totalPending = APPROVAL_TABS.reduce((sum, tab) => sum + tab.count, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals Center"
        subtitle="Centralized review queue for transfer, customer, payment, and onboarding approvals."
        actions={
          <div className="flex items-center gap-2">
            <ClipboardCheck className="text-primary size-5" />
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
              {totalPending} Pending
            </Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {APPROVAL_TABS.slice(0, 4).map((tab) => (
          <StatCard
            key={tab.id}
            label={tab.label.toUpperCase()}
            value={tab.count}
            subtext="Awaiting review"
            valueVariant="warning"
            href={tab.href}
          />
        ))}
      </div>

      <Tabs defaultValue="transfers">
        <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
          {APPROVAL_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-primary rounded-full border border-gray-200 px-4 py-2 data-[state=active]:text-white"
            >
              <tab.icon className="mr-1.5 size-3.5" />
              {tab.label}
              <Badge
                variant="secondary"
                className="ml-2 rounded-full px-1.5 py-0 text-[10px]"
              >
                {tab.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {APPROVAL_TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-base font-semibold text-[#1A1A1A]">
                  {tab.label}
                </h2>
                <Link
                  href={tab.href}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Open module →
                </Link>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Reference</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_QUEUE.filter((item) => item.tab === tab.id).map(
                    (item) => (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer hover:bg-gray-50/80"
                        onClick={() => router.push(item.href)}
                      >
                        <TableCell className="font-medium">
                          {item.reference}
                        </TableCell>
                        <TableCell>{item.entity}</TableCell>
                        <TableCell className="text-[#64748B]">
                          {item.type}
                        </TableCell>
                        <TableCell className="text-[#64748B]">
                          {item.submitted}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.priority === "High"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {item.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={item.href}
                            className="text-primary text-sm font-medium hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Review
                          </Link>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
