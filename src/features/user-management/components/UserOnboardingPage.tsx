"use client";

import { Building2, UserCog, UserPlus, Users } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/PageHeader";
import { ROUTES } from "@/constants/routes";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";

const ONBOARDING_OPTIONS = [
  {
    id: "customer",
    label: "Register Customer",
    description: "Onboard a new B2B contractor or builder account.",
    href: ROUTES.CUSTOMER_EXECUTIVE_CUSTOMERS_NEW,
    icon: Users,
    iconBg: "bg-orange-50",
    iconColor: "text-primary",
  },
  {
    id: "executive",
    label: "Customer Executive",
    description: "Add a new customer support executive to the network.",
    href: ROUTES.CUSTOMER_EXECUTIVE_ADD,
    icon: UserPlus,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: "manager",
    label: "Sub-Hub Manager",
    description: "Onboard a regional hub manager with permissions.",
    href: ROUTES.SUB_HUB_MANAGER_ADD,
    icon: UserCog,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    id: "hub",
    label: "Hub Onboarding",
    description: "Launch the sub-hub registration and activation wizard.",
    href: ROUTES.SUB_HUB_ADD,
    icon: Building2,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
] as const;

export function UserOnboardingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="User Onboarding"
        subtitle="Select the onboarding workflow for customers, executives, managers, or hubs."
        breadcrumbs={getNavBreadcrumbsFromPath("/user-management/onboarding")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ONBOARDING_OPTIONS.map((option) => (
          <Link
            key={option.id}
            href={option.href}
            className="hover:border-primary/20 rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-colors hover:bg-gray-50/50"
          >
            <div
              className={`mb-4 flex size-12 items-center justify-center rounded-full ${option.iconBg}`}
            >
              <option.icon className={`size-5 ${option.iconColor}`} />
            </div>
            <h3 className="font-semibold text-[#1A1A1A]">{option.label}</h3>
            <p className="mt-2 text-sm text-[#64748B]">{option.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
