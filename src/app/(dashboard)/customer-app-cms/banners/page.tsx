import type { Metadata } from "next";
import { Download, Filter, Plus } from "lucide-react";

import { FilterToolbar } from "@/components/shared/FilterToolbar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { BannerModificationsTable } from "@/features/cms/components/BannerModificationsTable";
import { BannerPreviewTable } from "@/features/cms/components/BannerPreviewTable";
import {
  BANNER_MODIFICATIONS,
  BANNERS,
} from "@/features/cms/constants/banner.mock";

export const metadata: Metadata = {
  title: "Banner Management",
};

export default function BannerManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Banner Management"
        subtitle="You have 12 active banners running across all states."
        breadcrumbs={getNavBreadcrumbsFromPath("/customer-app-cms/banners")}
        actions={
          <Button size="lg" className="h-10 gap-2 px-4">
            <Plus className="size-4" />
            Add Banner
          </Button>
        }
      />

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <FilterToolbar className="mb-6" />
        <BannerPreviewTable banners={BANNERS} />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Recent Banner Modifications
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="size-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="size-4" />
              Export CSV
            </Button>
          </div>
        </div>
        <BannerModificationsTable modifications={BANNER_MODIFICATIONS} />
      </div>
    </div>
  );
}
