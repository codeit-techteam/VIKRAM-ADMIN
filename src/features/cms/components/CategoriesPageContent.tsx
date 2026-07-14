"use client";

import {
  Download,
  Eye,
  EyeOff,
  LayoutGrid,
  FolderOpen,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ConfirmationDialog } from "@/components/allocation/ConfirmationDialog";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { CategoryTable } from "@/features/cms/components/CategoryTable";
import {
  CATEGORY_FILTER_TABS,
  type CategoryFilterValue,
} from "@/features/cms/constants/category.mock";
import {
  deleteCategory,
  getCategories,
  getCategoryStats,
} from "@/features/cms/services/category.mock-api";
import type {
  Category,
  CategoryStats,
} from "@/features/cms/types/category.types";
import { cn } from "@/lib/utils";

const EMPTY_STATS: CategoryStats = {
  totalCategories: 0,
  empty: 0,
  visible: 0,
  notVisible: 0,
};

export function CategoriesPageContent() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilterValue>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const [nextCategories, nextStats] = await Promise.all([
      getCategories(),
      getCategoryStats(),
    ]);
    setCategories(nextCategories);
    setStats(nextStats);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredCategories = useMemo(() => {
    switch (activeFilter) {
      case "empty":
        return categories.filter((category) => category.productCount === 0);
      case "visible":
        return categories.filter((category) => category.isVisible);
      case "not-visible":
        return categories.filter((category) => !category.isVisible);
      default:
        return categories;
    }
  }, [activeFilter, categories]);

  const handleStatCardClick = (filter: CategoryFilterValue) => {
    setActiveFilter((current) => (current === filter ? "all" : filter));
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    await deleteCategory(categoryToDelete.id);
    setIsDeleting(false);
    setCategoryToDelete(null);
    await refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories Management"
        subtitle="Organize and prioritize your construction supply hierarchy."
        breadcrumbs={getNavBreadcrumbsFromPath("/customer-app-cms/categories")}
        actions={
          <>
            <Button variant="outline" size="lg" className="h-10 gap-2 px-4">
              <Download className="size-4" />
              Export Categories
            </Button>
            <Link
              href="/customer-app-cms/categories/new"
              className={cn(buttonVariants({ size: "lg" }), "h-10 gap-2 px-4")}
            >
              <Plus className="size-4" />
              Add Category
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Categories"
          value={isLoading ? "—" : stats.totalCategories}
          icon={LayoutGrid}
          iconContainerClassName="bg-orange-50"
          iconClassName="text-primary"
          isLoading={isLoading}
          isActive={activeFilter === "all"}
          onClick={() => handleStatCardClick("all")}
        />
        <StatCard
          label="Empty Categories"
          value={isLoading ? "—" : stats.empty}
          icon={FolderOpen}
          iconContainerClassName="bg-blue-50"
          iconClassName="text-blue-600"
          isLoading={isLoading}
          isActive={activeFilter === "empty"}
          onClick={() => handleStatCardClick("empty")}
        />
        <StatCard
          label="Visible"
          value={isLoading ? "—" : stats.visible}
          icon={Eye}
          iconContainerClassName="bg-emerald-50"
          iconClassName="text-emerald-600"
          isLoading={isLoading}
          isActive={activeFilter === "visible"}
          onClick={() => handleStatCardClick("visible")}
        />
        <StatCard
          label="Not Visible"
          value={isLoading ? "—" : stats.notVisible}
          icon={EyeOff}
          iconContainerClassName="bg-gray-100"
          iconClassName="text-gray-500"
          isLoading={isLoading}
          isActive={activeFilter === "not-visible"}
          onClick={() => handleStatCardClick("not-visible")}
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
            Showing {filteredCategories.length} of {stats.totalCategories}{" "}
            Categories
          </p>
        </div>

        <div className="mt-6">
          <CategoryTable
            categories={filteredCategories}
            onDelete={setCategoryToDelete}
          />
        </div>

        <button
          type="button"
          className="text-primary mt-4 text-sm font-medium hover:underline"
          onClick={() => setActiveFilter("all")}
        >
          View All {stats.totalCategories} Categories
        </button>
      </div>

      <ConfirmationDialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
        title="Delete this category?"
        message={
          categoryToDelete
            ? `"${categoryToDelete.name}" will be removed from the CMS. Products remain in the database and are not deleted.`
            : undefined
        }
        confirmLabel="Delete Category"
        isSubmitting={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
