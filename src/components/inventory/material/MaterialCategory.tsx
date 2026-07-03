"use client";

import { Tags } from "lucide-react";
import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MATERIAL_CATEGORIES, getSubCategories } from "@/mock/categories";
import type { MaterialFormSchema } from "@/schema/material-form.schema";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

export function MaterialCategory() {
  const { control, watch, setValue } = useFormContext<MaterialFormSchema>();
  const category = watch("category");
  const tags = watch("tags");

  const subCategories = useMemo(() => getSubCategories(category), [category]);

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag || tags.includes(tag)) return;
    setValue("tags", [...tags, tag], { shouldDirty: true });
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter((current) => current !== tag),
      { shouldDirty: true },
    );
  };

  return (
    <FormSectionCard icon={Tags} title="Category Assignment">
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Controller
            control={control}
            name="category"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Category *</Label>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("subCategory", "", { shouldDirty: true });
                  }}
                >
                  <SelectTrigger aria-invalid={!!fieldState.error}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_CATEGORIES.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            name="subCategory"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Sub Category</Label>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!category}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        category
                          ? "Select sub category"
                          : "Select a category first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label className={fieldLabelClassName}>Tags</Label>
          <Input
            placeholder="Type a tag and press Enter"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addTag(event.currentTarget.value);
                event.currentTarget.value = "";
              }
            }}
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer gap-1.5 pr-1.5"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <span className="text-xs text-gray-400">×</span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Controller
          control={control}
          name="searchKeywords"
          render={({ field }) => (
            <div className="space-y-2">
              <Label className={fieldLabelClassName}>Search Keywords</Label>
              <Input
                {...field}
                placeholder="cement, opc 53, ultratech, construction"
              />
              <p className="text-xs text-gray-400">
                Comma-separated keywords to improve warehouse search and
                discovery.
              </p>
            </div>
          )}
        />
      </div>
    </FormSectionCard>
  );
}
