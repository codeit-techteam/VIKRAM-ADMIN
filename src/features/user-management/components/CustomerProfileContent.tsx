"use client";

import {
  Activity,
  ArrowLeft,
  Building2,
  MapPin,
  Package,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CustomerActivityTimeline } from "@/features/user-management/components/CustomerActivityTimeline";
import { CustomerRecentOrdersTable } from "@/features/user-management/components/CustomerRecentOrdersTable";
import { CustomerStatusBadge } from "@/features/user-management/components/CustomerStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CUSTOMER_TYPE_LABELS } from "@/features/user-management/types/customer.types";
import { buildCustomerActivityTimeline } from "@/mock/customer-service";
import { ROUTES } from "@/constants/routes";
import { useCustomerStore } from "@/store/customer-store";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/lib/utils";

interface CustomerProfileContentProps {
  customerId: string;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[#1A1A1A]">{value}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

export function CustomerProfileContent({
  customerId,
}: CustomerProfileContentProps) {
  const getCustomer = useCustomerStore((state) => state.getCustomer);
  const customers = useCustomerStore((state) => state.customers);
  const orders = useCustomerStore((state) => state.orders);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 400);
    return () => window.clearTimeout(timer);
  }, []);

  const customer = useMemo(
    () => getCustomer(customerId),
    [getCustomer, customerId, customers, orders],
  );

  const timeline = useMemo(
    () => (customer ? buildCustomerActivityTimeline(customer) : []),
    [customer],
  );

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!customer) {
    return (
      <div className="space-y-4">
        <Link
          href={ROUTES.USER_MANAGEMENT_CUSTOMERS}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#1A1A1A]"
        >
          <ArrowLeft className="size-4" />
          Back to Customers
        </Link>
        <EmptyState
          title="Customer not found"
          description="The requested customer profile could not be located."
        />
      </div>
    );
  }

  const hasOrders = customer.orderSummary.totalOrders > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={ROUTES.USER_MANAGEMENT_CUSTOMERS}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#1A1A1A]"
          >
            <ArrowLeft className="size-4" />
            Back to Customers
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
            {customer.name}
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Customer ID: {customer.customerId}
          </p>
        </div>
        <CustomerStatusBadge status={customer.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FormSectionCard icon={User} title="Basic Information">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailField label="Customer Name" value={customer.name} />
            <DetailField label="Customer ID" value={customer.customerId} />
            <DetailField label="Phone" value={customer.phone} />
            <DetailField label="Email" value={customer.email} />
            <DetailField
              label="Customer Type"
              value={CUSTOMER_TYPE_LABELS[customer.customerType]}
            />
            <DetailField
              label="Registration Date"
              value={formatDate(customer.registrationDate)}
            />
            <DetailField
              label="Status"
              value={customer.status.replace("_", " ")}
            />
          </div>
        </FormSectionCard>

        <FormSectionCard icon={Building2} title="Assigned Operations">
          {hasOrders ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField
                label="Assigned Hub"
                value={customer.assignedOperations.hubName}
              />
              <DetailField
                label="Assigned Executive"
                value={customer.assignedOperations.executiveName}
              />
              <DetailField
                label="Executive Contact"
                value={
                  customer.assignedOperations.executiveContact ??
                  "Not Available"
                }
              />
              <DetailField
                label="Hub Location"
                value={
                  customer.assignedOperations.hubLocation ?? "Not Available"
                }
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50/50 px-4 py-6 text-center">
              <p className="text-sm font-medium text-amber-800">Not Assigned</p>
              <p className="mt-1 text-sm text-amber-700">
                Waiting for first order.
              </p>
            </div>
          )}
        </FormSectionCard>
      </div>

      <FormSectionCard icon={Package} title="Order Summary">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <DetailField
            label="Total Orders"
            value={String(customer.orderSummary.totalOrders)}
          />
          <DetailField
            label="Active Orders"
            value={String(customer.orderSummary.activeOrders)}
          />
          <DetailField
            label="Delivered Orders"
            value={String(customer.orderSummary.deliveredOrders)}
          />
          <DetailField
            label="Cancelled Orders"
            value={String(customer.orderSummary.cancelledOrders)}
          />
          <DetailField
            label="Last Order Date"
            value={
              customer.orderSummary.lastOrderDate
                ? formatDate(customer.orderSummary.lastOrderDate)
                : "No Orders Yet"
            }
          />
        </div>

        {hasOrders ? (
          <div className="mt-6">
            <h3 className="mb-4 text-sm font-semibold text-[#1A1A1A]">
              Recent Orders
            </h3>
            <CustomerRecentOrdersTable orders={customer.orders.slice(0, 5)} />
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No Orders Yet"
              description="This customer has not placed any orders. Operations assignment will begin after the first order."
              icon={<ShoppingBag className="size-10" />}
              className="py-12"
            />
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/customer-app-cms"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-9 px-4",
                )}
              >
                View Customer App
              </Link>
              <Button variant="secondary" disabled>
                Wait for First Order
              </Button>
            </div>
          </div>
        )}
      </FormSectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <FormSectionCard icon={MapPin} title="Address">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailField
              label="Primary Address"
              value={customer.address.primaryAddress}
            />
            <DetailField label="City" value={customer.address.city} />
            <DetailField label="State" value={customer.address.state} />
            <DetailField label="Pincode" value={customer.address.pincode} />
            <DetailField label="Service Hub" value={customer.serviceHub} />
          </div>
        </FormSectionCard>

        <FormSectionCard icon={Activity} title="Activity Timeline">
          <CustomerActivityTimeline events={timeline} />
        </FormSectionCard>
      </div>
    </div>
  );
}
