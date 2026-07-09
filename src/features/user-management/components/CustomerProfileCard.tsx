"use client";

import {
  Building2,
  Calendar,
  Hash,
  Mail,
  MapPin,
  Phone,
  User,
  UserCheck,
} from "lucide-react";

import { CustomerStatusBadge } from "@/features/user-management/components/CustomerStatusBadge";
import {
  CUSTOMER_KYC_STATUS_LABELS,
  CUSTOMER_TYPE_LABELS,
  type CustomerDetail,
} from "@/features/user-management/types/customer.types";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/lib/utils";

interface CustomerProfileCardProps {
  customer: CustomerDetail;
  className?: string;
}

const AVATAR_COLORS = [
  "bg-amber-100 text-amber-800",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(id: string): string {
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
        <Icon className="size-4 text-[#64748B]" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium break-words text-[#1A1A1A]">
          {value}
        </p>
      </div>
    </div>
  );
}

export function CustomerProfileCard({
  customer,
  className,
}: CustomerProfileCardProps) {
  const hasOrders = customer.orderSummary.totalOrders > 0;
  const kycStyles =
    customer.kycStatus === "VERIFIED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : customer.kycStatus === "REJECTED"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <aside
      className={cn(
        "overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm",
        className,
      )}
    >
      <div className="bg-gradient-to-b from-[#8B5E3C] to-[#6B4423] px-6 pt-8 pb-16 text-center">
        <div
          className={cn(
            "mx-auto flex size-24 items-center justify-center rounded-full border-4 border-white/20 text-2xl font-bold shadow-lg",
            customer.imageUrl ? "bg-white" : getAvatarColor(customer.id),
          )}
        >
          {customer.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={customer.imageUrl}
              alt={customer.name}
              className="size-full rounded-full object-cover"
            />
          ) : (
            getInitials(customer.name)
          )}
        </div>
      </div>

      <div className="-mt-10 px-6 pb-6">
        <div className="text-center">
          <h2 className="text-lg font-bold text-[#1A1A1A]">{customer.name}</h2>
          {customer.designation ? (
            <p className="mt-0.5 text-sm text-[#64748B]">
              {customer.designation}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase",
                kycStyles,
              )}
            >
              {CUSTOMER_KYC_STATUS_LABELS[customer.kycStatus]}
            </span>
            <CustomerStatusBadge status={customer.status} />
          </div>
        </div>

        <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
          <InfoRow icon={Mail} label="Email" value={customer.email} />
          <InfoRow icon={Phone} label="Phone" value={customer.phone} />
          <InfoRow
            icon={Hash}
            label="Customer ID"
            value={customer.customerId}
          />
          <InfoRow
            icon={Calendar}
            label="Registration Date"
            value={formatDate(customer.registrationDate)}
          />
          <InfoRow
            icon={User}
            label="Customer Type"
            value={CUSTOMER_TYPE_LABELS[customer.customerType]}
          />
        </div>

        <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
          <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Operations
          </p>
          {hasOrders ? (
            <>
              <InfoRow
                icon={Building2}
                label="Assigned Hub"
                value={customer.assignedOperations.hubName}
              />
              <InfoRow
                icon={UserCheck}
                label="Assigned Executive"
                value={customer.assignedOperations.executiveName}
              />
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50/50 px-4 py-4 text-center">
              <p className="text-sm font-medium text-amber-800">Not Assigned</p>
              <p className="mt-1 text-xs text-amber-700">
                Waiting for first order.
              </p>
            </div>
          )}
          <InfoRow
            icon={MapPin}
            label="Service Hub"
            value={customer.serviceHub}
          />
        </div>
      </div>
    </aside>
  );
}
