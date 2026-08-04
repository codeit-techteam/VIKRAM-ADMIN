"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/shared/PageHeader";
import { QuickActionCardFromData } from "@/components/shared/QuickActionCard";
import { EnterpriseGlobalSearch } from "@/components/layout/global-search";
import { StatCard } from "@/components/shared/StatCard";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { ContentUpdatesTable } from "@/features/cms/components/ContentUpdatesTable";
import { CMS_QUICK_ACTIONS } from "@/features/cms/constants/cms.mock";
import type {
  ContentUpdate,
  CmsStatCardData,
} from "@/features/cms/types/cms.types";
import { dashboardService } from "@/services/dashboard";
import { auditService } from "@/services/audit.service";
import { notify } from "@/utils/notify";

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString("en-IN");
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function mapAuditToContentUpdate(row: {
  id: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  adminEmail?: string | null;
  createdAt: string;
  newValue?: unknown;
}): ContentUpdate {
  const status: ContentUpdate["status"] =
    row.action === "PUBLISH" || row.action === "CREATE"
      ? "Live"
      : row.action === "UNPUBLISH" || row.action === "DELETE"
        ? "Expired"
        : "Draft";

  const nameFromValue =
    typeof row.newValue === "object" &&
    row.newValue &&
    "title" in (row.newValue as object)
      ? String((row.newValue as { title?: string }).title)
      : typeof row.newValue === "object" &&
          row.newValue &&
          "name" in (row.newValue as object)
        ? String((row.newValue as { name?: string }).name)
        : row.resource;

  return {
    id: row.id,
    assetName: nameFromValue || `${row.resource} ${row.action}`,
    subtitle: `${row.action} · ${row.resource}`,
    thumbnailUrl: "",
    type: row.resource,
    status,
    updatedBy: row.adminEmail || "Super Admin",
    lastModified: relativeTime(row.createdAt),
  };
}

export function CmsDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statCards, setStatCards] = useState<CmsStatCardData[]>([]);
  const [updates, setUpdates] = useState<ContentUpdate[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [dashboard, audit] = await Promise.all([
          dashboardService.getAdminDashboard(),
          auditService.list({ limit: 12 }),
        ]);
        if (cancelled) return;

        setStatCards([
          {
            label: "ACTIVE PRODUCTS",
            value: formatCount(dashboard.cms.activeProducts ?? 0),
            href: "/customer-app-cms/catalog",
          },
          {
            label: "CATALOGS",
            value: formatCount(dashboard.cms.categories ?? 0),
            href: "/customer-app-cms/categories",
          },
          {
            label: "ACTIVE OFFERS",
            value: formatCount(dashboard.cms.activeOffers ?? 0),
            href: "/customer-app-cms/offers",
          },
          {
            label: "CUSTOMERS",
            value: formatCount(dashboard.customers.total ?? 0),
            href: "/user-management/customers",
          },
          {
            label: "NOTIFICATIONS",
            value: formatCount(dashboard.cms.notifications ?? 0),
            href: "/customer-app-cms/push-notifications",
          },
        ]);

        setUpdates(
          (audit.items ?? []).map((item) => mapAuditToContentUpdate(item)),
        );
      } catch (error) {
        notify.error(
          error instanceof Error
            ? error.message
            : "Failed to load CMS dashboard",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(
    () =>
      loading
        ? [
            { label: "ACTIVE PRODUCTS", value: "…" },
            { label: "CATALOGS", value: "…" },
            { label: "ACTIVE OFFERS", value: "…" },
            { label: "CUSTOMERS", value: "…" },
            { label: "NOTIFICATIONS", value: "…" },
          ]
        : statCards,
    [loading, statCards],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bajriwala Dashboard"
        breadcrumbs={getNavBreadcrumbsFromPath("/customer-app-cms")}
        actions={<EnterpriseGlobalSearch variant="button" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
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

      <ContentUpdatesTable updates={updates} />
    </div>
  );
}
