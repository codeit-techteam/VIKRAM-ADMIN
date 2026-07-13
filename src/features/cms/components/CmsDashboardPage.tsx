"use client";

import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/shared/PageHeader";
import { QuickActionCardFromData } from "@/components/shared/QuickActionCard";
import { EnterpriseGlobalSearch } from "@/components/layout/global-search";
import { StatCard } from "@/components/shared/StatCard";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { ContentUpdatesTable } from "@/features/cms/components/ContentUpdatesTable";
import {
  CMS_QUICK_ACTIONS,
  CMS_STAT_CARDS,
  CONTENT_UPDATES,
} from "@/features/cms/constants/cms.mock";

export function CmsDashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bajriwala Dashboard"
        breadcrumbs={getNavBreadcrumbsFromPath("/customer-app-cms")}
        actions={<EnterpriseGlobalSearch variant="button" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {CMS_STAT_CARDS.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            href={card.href}
          />
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-base font-semibold text-[#1A1A1A]">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CMS_QUICK_ACTIONS.map((action) => (
            <QuickActionCardFromData
              key={action.id}
              label={action.label}
              iconName={action.iconName}
              circleColor={action.circleColor}
              onClick={
                action.href ? () => router.push(action.href!) : undefined
              }
            />
          ))}
        </div>
      </div>

      <ContentUpdatesTable updates={CONTENT_UPDATES} />
    </div>
  );
}
