"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Image as ImageIcon, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import {
  FileDropzone,
  type MockUploadFile,
} from "@/components/shared/FileDropzone";
import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  categoryFormSchema,
  type CategoryFormSchema,
} from "@/features/cms/schema/category-form.schema";
import {
  createCategory,
  updateCategory,
} from "@/features/cms/services/category.mock-api";
import type { Category } from "@/features/cms/types/category.types";
import { cn } from "@/lib/utils";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

interface CategoryFormProps {
  mode: "create" | "edit";
  initialCategory?: Category;
}

function categoryToFormValues(category: Category): CategoryFormSchema {
  return {
    name: category.name,
    displayOrder: category.displayOrder,
    isVisible: category.isVisible,
  };
}

export function CategoryForm({ mode, initialCategory }: CategoryFormProps) {
  const router = useRouter();
  const [iconUpload, setIconUpload] = useState<MockUploadFile | null>(null);
  const [heroUpload, setHeroUpload] = useState<MockUploadFile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { control, handleSubmit, watch } = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: initialCategory
      ? categoryToFormValues(initialCategory)
      : {
          name: "",
          displayOrder: 10,
          isVisible: true,
        },
  });

  const isVisible = watch("isVisible");
  const isEdit = mode === "edit";

  const onSave = async (data: CategoryFormSchema) => {
    setIsSaving(true);
    try {
      if (isEdit && initialCategory) {
        await updateCategory(initialCategory.id, data);
      } else {
        await createCategory(data);
      }
      router.push("/customer-app-cms/categories");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Customer App CMS", href: "/customer-app-cms" },
          { label: "Categories", href: "/customer-app-cms/categories" },
          { label: isEdit ? "Edit Category" : "Add New Category" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            {isEdit ? "Edit Category" : "Add New Category"}
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            {isEdit
              ? "Update category details and Customer App visibility."
              : "Configure global product categories for the Bajriwala customer marketplace."}
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="h-10 shrink-0 gap-2 px-4"
          render={<Link href="/customer-app-cms/categories" />}
        >
          <ArrowLeft className="size-4" />
          Back to Categories
        </Button>
      </div>

      <FormSectionCard icon={Info} title="Category Details">
        <div className="space-y-5">
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="category-name" className={fieldLabelClassName}>
                  Category Name
                </Label>
                <Input
                  {...field}
                  id="category-name"
                  placeholder="e.g., Heavy Machinery & Excavators"
                  aria-invalid={!!fieldState.error}
                />
                {fieldState.error && (
                  <p className="text-destructive text-sm">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Controller
              control={control}
              name="displayOrder"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label
                    htmlFor="display-order"
                    className={fieldLabelClassName}
                  >
                    Display Order
                  </Label>
                  <Input
                    {...field}
                    id="display-order"
                    type="number"
                    min={0}
                    aria-invalid={!!fieldState.error}
                    onChange={(event) =>
                      field.onChange(event.target.valueAsNumber)
                    }
                  />
                  {fieldState.error && (
                    <p className="text-destructive text-sm">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              control={control}
              name="isVisible"
              render={({ field }) => (
                <div className="flex h-full flex-col items-end justify-end gap-1.5 pb-2">
                  <div className="flex items-center gap-3">
                    <Label
                      htmlFor="category-visibility"
                      className="text-sm font-medium text-[#1A1A1A]"
                    >
                      Visibility
                    </Label>
                    <Switch
                      id="category-visibility"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-checked:bg-emerald-500"
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isVisible ? "text-emerald-600" : "text-gray-400",
                      )}
                    >
                      {isVisible ? "Visible" : "Not Visible"}
                    </span>
                  </div>
                  <p className="max-w-xs text-right text-xs text-gray-400">
                    {isVisible
                      ? "Appears in the Customer App (Home, Listing, Search, Filters)."
                      : "Hidden from the Customer App. Products stay in the database."}
                  </p>
                </div>
              )}
            />
          </div>
        </div>
      </FormSectionCard>

      <FormSectionCard icon={ImageIcon} title="Visual Assets">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className={fieldLabelClassName}>
              Category Icon (SVG Preferred)
            </Label>
            <Controller
              control={control}
              name="iconFile"
              render={({ field }) => (
                <FileDropzone
                  variant="compact"
                  label="Click or drag to upload icon"
                  helperText="MAX 512KB (SVG, PNG)"
                  accept={{
                    "image/svg+xml": [".svg"],
                    "image/png": [".png"],
                  }}
                  maxSize={512 * 1024}
                  selectedFile={iconUpload}
                  onFileSelect={setIconUpload}
                  onFileChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className={fieldLabelClassName}>Category Hero Image</Label>
            <Controller
              control={control}
              name="heroImageFile"
              render={({ field }) => (
                <FileDropzone
                  variant="compact"
                  label="Upload cover image"
                  helperText="1200x400px Recommended"
                  accept={{
                    "image/jpeg": [".jpg", ".jpeg"],
                    "image/png": [".png"],
                    "image/webp": [".webp"],
                  }}
                  maxSize={5 * 1024 * 1024}
                  selectedFile={heroUpload}
                  onFileSelect={setHeroUpload}
                  onFileChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </FormSectionCard>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-10 px-5"
          render={<Link href="/customer-app-cms/categories" />}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button type="submit" className="h-10 px-5" disabled={isSaving}>
          {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Save Category"}
        </Button>
      </div>
    </form>
  );
}
