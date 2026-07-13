"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/features/cms/components/CategoryForm";
import { getCategoryById } from "@/features/cms/services/category.mock-api";
import type { Category } from "@/features/cms/types/category.types";

interface EditCategoryPageProps {
  params: Promise<{ categoryId: string }>;
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { categoryId } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getCategoryById(categoryId).then((result) => {
      setCategory(result);
      setIsLoading(false);
    });
  }, [categoryId]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-[#64748B]">Loading category...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-base font-semibold text-[#1A1A1A]">
          Category not found
        </p>
        <p className="mt-1 text-sm text-[#64748B]">
          This category may have been deleted.
        </p>
        <Button
          className="mt-4"
          render={<Link href="/customer-app-cms/categories" />}
        >
          Back to Categories
        </Button>
      </div>
    );
  }

  return <CategoryForm mode="edit" initialCategory={category} />;
}
