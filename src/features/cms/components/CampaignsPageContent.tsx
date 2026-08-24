"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import {
  cmsAdminService,
  type AdminAdvertisement,
  type AdminPromotionalCard,
} from "@/services/cms-admin.service";
import {
  bannersService,
  type AdminBanner,
} from "@/services/cms-banners.service";
import { notify } from "@/utils/notify";

type CampaignRow = {
  id: string;
  name: string;
  type: string;
  startsAt?: string | null;
  endsAt?: string | null;
  status: "Draft" | "Scheduled" | "Published" | "Expired";
};

function campaignStatus(
  startsAt?: string | null,
  endsAt?: string | null,
  active?: boolean,
): CampaignRow["status"] {
  const now = Date.now();
  if (!active) return "Draft";
  if (endsAt && new Date(endsAt).getTime() < now) return "Expired";
  if (startsAt && new Date(startsAt).getTime() > now) return "Scheduled";
  return "Published";
}

export function CampaignsPageContent() {
  const [rows, setRows] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [banners, ads, cards] = await Promise.all([
        bannersService.list(),
        cmsAdminService.listAds(),
        cmsAdminService.listPromotionalCards(),
      ]);

      const bannerRows: CampaignRow[] = banners.map((b: AdminBanner) => ({
        id: b.id,
        name: b.title,
        type: `Banner · ${b.placement}`,
        startsAt: b.startsAt,
        endsAt: b.endsAt,
        status: campaignStatus(b.startsAt, b.endsAt, b.isVisible),
      }));

      const adRows: CampaignRow[] = ads.map((a: AdminAdvertisement) => ({
        id: a.id,
        name: a.title,
        type: `Brand Ad · ${a.brandName}`,
        startsAt: a.startsAt,
        endsAt: a.endsAt,
        status: campaignStatus(a.startsAt, a.endsAt, a.isActive),
      }));

      const cardRows: CampaignRow[] = cards.map((c: AdminPromotionalCard) => ({
        id: c.id,
        name: c.title,
        type: `Promo · ${c.cardType}`,
        startsAt: c.startsAt,
        endsAt: c.endsAt,
        status: campaignStatus(c.startsAt, c.endsAt, c.isActive),
      }));

      setRows([...bannerRows, ...adRows, ...cardRows]);
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to load campaigns",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const counts = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc[row.status] += 1;
        return acc;
      },
      { Draft: 0, Scheduled: 0, Published: 0, Expired: 0 },
    );
  }, [rows]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaign Scheduler"
        description="Overview of scheduled CMS campaigns. Expired items disappear automatically from the Customer App."
        breadcrumbs={getNavBreadcrumbsFromPath("/customer-app-cms/campaigns")}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        {(["Published", "Scheduled", "Draft", "Expired"] as const).map(
          (key) => (
            <div key={key} className="rounded-xl border bg-white p-4">
              <p className="text-muted-foreground text-xs">{key}</p>
              <p className="text-2xl font-semibold">{counts[key]}</p>
            </div>
          ),
        )}
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        {loading ? (
          <p className="text-muted-foreground p-6 text-sm">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Start</th>
                <th className="px-4 py-3 font-medium">End</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={`${row.type}-${row.id}`}>
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="text-muted-foreground px-4 py-3">
                    {row.type}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {row.startsAt
                      ? new Date(row.startsAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {row.endsAt ? new Date(row.endsAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
