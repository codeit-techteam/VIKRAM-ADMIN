"use client";

import { format } from "date-fns";
import { Image as ImageIcon, Star, Video } from "lucide-react";
import Link from "next/link";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { CustomerFeaturesDashboardData } from "@/features/dashboard/types/dashboard.types";

interface CustomerFeaturesSectionProps {
  data: CustomerFeaturesDashboardData;
  isLoading?: boolean;
}

function SectionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function CustomerFeaturesSection({
  data,
  isLoading,
}: CustomerFeaturesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashboardCard
          title="Recent Membership Purchases"
          action={
            <Link
              href="/user-management/membership-plans"
              className="text-primary text-sm font-medium hover:underline"
            >
              View all
            </Link>
          }
        >
          {isLoading ? (
            <SectionSkeleton />
          ) : (
            <div className="divide-y divide-gray-100">
              {data.recentMembershipPurchases.map((purchase) => (
                <Link
                  key={purchase.id}
                  href={purchase.href}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {purchase.customer}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {purchase.plan} ·{" "}
                      {format(new Date(purchase.date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[#1A1A1A]">
                    {purchase.amount}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          title="Latest Wallet Refunds"
          action={
            <Link
              href="/finance-payments/customer-wallet"
              className="text-primary text-sm font-medium hover:underline"
            >
              View all
            </Link>
          }
        >
          {isLoading ? (
            <SectionSkeleton />
          ) : (
            <div className="divide-y divide-gray-100">
              {data.latestWalletRefunds.map((refund) => (
                <Link
                  key={refund.id}
                  href={refund.href}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {refund.customer}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {refund.orderNumber} ·{" "}
                      {format(new Date(refund.date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      {refund.amount}
                    </p>
                    <span
                      className={`text-xs font-medium ${refund.status === "COMPLETED" ? "text-green-600" : "text-amber-600"}`}
                    >
                      {refund.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashboardCard
          title="Bulk Procurement Leads"
          action={
            <Link
              href="/customer-executive/bulk-procurement"
              className="text-primary text-sm font-medium hover:underline"
            >
              View all
            </Link>
          }
        >
          {isLoading ? (
            <SectionSkeleton />
          ) : (
            <div className="divide-y divide-gray-100">
              {data.bulkLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={lead.href}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {lead.company}
                    </p>
                    <p className="text-xs text-[#64748B]">{lead.project}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      {lead.value}
                    </p>
                    <span className="text-xs font-medium text-blue-600">
                      {lead.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          title="Latest Customer Testimonials"
          action={
            <Link
              href="/customer-app-cms/testimonials"
              className="text-primary text-sm font-medium hover:underline"
            >
              Manage
            </Link>
          }
        >
          {isLoading ? (
            <SectionSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.latestTestimonials.map((testimonial) => (
                <Link
                  key={testimonial.id}
                  href={testimonial.href}
                  className="flex gap-3 rounded-lg border border-gray-100 p-3 transition-shadow hover:shadow-md"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={testimonial.mediaUrl}
                      alt={testimonial.customerName}
                      className="size-full object-cover"
                    />
                    {testimonial.type === "VIDEO" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Video className="size-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-sm font-medium text-[#1A1A1A]">
                        {testimonial.customerName}
                      </p>
                      {testimonial.type === "IMAGE" ? (
                        <ImageIcon className="size-3 text-[#64748B]" />
                      ) : null}
                    </div>
                    <p className="text-xs text-[#64748B]">{testimonial.city}</p>
                    <div className="mt-1 flex">
                      {Array.from({ length: testimonial.rating }).map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="size-3 fill-amber-400 text-amber-400"
                          />
                        ),
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-[#64748B]">
                      {testimonial.review}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
