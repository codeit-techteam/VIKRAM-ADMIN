"use client";

import {
  CheckCircle2,
  ClipboardList,
  Download,
  EyeOff,
  LayoutGrid,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";

import { FilterTabs } from "@/components/shared/FilterTabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { CategoryTable } from "@/features/cms/components/CategoryTable";
import {
  CATEGORY_DISPLAYED_COUNT,
  CATEGORY_FILTER_TABS,
  CATEGORY_MOCK_ROWS,
  CATEGORY_STATS,
  CATEGORY_TOTAL_COUNT,
  type CategoryFilterValue,
} from "@/features/cms/constants/category.mock";

export function CategoriesPageContent() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilterValue>("all");

  const filteredCategories = useMemo(() => {
    if (activeFilter === "all") {
      return CATEGORY_MOCK_ROWS;
    }

    if (activeFilter === "active") {
      return CATEGORY_MOCK_ROWS.filter(
        (category) => category.status === "ACTIVE",
      );
    }

    return CATEGORY_MOCK_ROWS.filter(
      (category) => category.status === "INACTIVE",
    );
  }, [activeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories Management"
        subtitle="Organize and prioritize your construction supply hierarchy."
        actions={
          <>
            <Button variant="outline" size="lg" className="h-10 gap-2 px-4">
              <Download className="size-4" />
              Export Categories
            </Button>
            <Button size="lg" className="h-10 gap-2 px-4">
              <Plus className="size-4" />
              Add Category
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Categories"
          value={CATEGORY_STATS.total}
          icon={LayoutGrid}
          iconContainerClassName="bg-orange-50"
          iconClassName="text-primary"
        />
        <StatCard
          label="Active"
          value={CATEGORY_STATS.active}
          icon={CheckCircle2}
          iconContainerClassName="bg-emerald-50"
          iconClassName="text-emerald-600"
        />
        <StatCard
          label="Hidden"
          value={CATEGORY_STATS.hidden}
          icon={EyeOff}
          iconContainerClassName="bg-gray-100"
          iconClassName="text-gray-500"
        />
        <StatCard
          label="Pending"
          value={CATEGORY_STATS.pending}
          icon={ClipboardList}
          iconContainerClassName="bg-amber-50"
          iconClassName="text-amber-600"
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <FilterTabs
            options={CATEGORY_FILTER_TABS}
            value={activeFilter}
            onChange={setActiveFilter}
          />
          <p className="text-sm text-gray-500">
            Showing {CATEGORY_DISPLAYED_COUNT} of {CATEGORY_TOTAL_COUNT}{" "}
            Categories
          </p>
        </div>

        <div className="mt-6">
          <CategoryTable categories={filteredCategories} />
        </div>

        <button
          type="button"
          className="text-primary mt-4 text-sm font-medium hover:underline"
        >
          View All {CATEGORY_TOTAL_COUNT} Categories
        </button>
      </div>
    </div>
  );
}
