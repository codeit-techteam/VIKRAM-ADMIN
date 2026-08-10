"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_FORM_DEFAULT_VALUES,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_UNIT_OPTIONS,
  productFormSchema,
  type ProductFormSchema,
} from "@/components/warehouse/products/product-form.schema";
import { MediaUploadGrid } from "@/features/catalog/components/MediaUploadGrid";
import type { ProductImage } from "@/features/catalog/schema/product-form.schema";
import type { WarehouseProduct } from "@/mock/warehouse-products";
import { catalogService } from "@/services/catalog.service";
import { notify } from "@/utils/notify";
import type { z } from "zod";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (product: WarehouseProduct) => void;
}

export function CreateProductDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateProductDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof productFormSchema>, unknown, ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues: PRODUCT_FORM_DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(PRODUCT_FORM_DEFAULT_VALUES);
      setImages([]);
    }
  }, [open, reset]);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && isSaving) return;
    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: ProductFormSchema) => {
    setIsSaving(true);
    try {
      const categories = await catalogService.listCategories();
      const normalizedCategory = data.category.toLowerCase();
      const category = categories.find(
        (item) =>
          item.id === data.category ||
          item.slug?.toLowerCase() === normalizedCategory ||
          item.name.toLowerCase() === normalizedCategory,
      );
      if (!category) {
        notify.error(
          "Category unavailable",
          "Select a valid catalog category.",
        );
        return;
      }

      const orderedImages = [...images].sort(
        (a, b) => Number(b.isMain) - Number(a.isMain),
      );
      const imageUrls = orderedImages.map((image) => image.url);

      const created = await catalogService.createProduct({
        name: data.name.trim(),
        slug: data.name
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        sku: data.sku.trim().toUpperCase(),
        categoryId: category.id,
        brand: data.brand.trim(),
        retailPrice: 0,
        unit: data.unit,
        initialStock: data.stockUnits,
        isVisible: data.status !== "INACTIVE",
        imageUrls: imageUrls.length ? imageUrls : undefined,
      });

      if (orderedImages.length) {
        await catalogService.setImages(
          created.id,
          orderedImages.map((image) => ({
            url: image.url,
            isPrimary: image.isMain,
          })),
        );
      }

      const product: WarehouseProduct = {
        id: created.id,
        name: created.name,
        sku: created.sku ?? data.sku.trim().toUpperCase(),
        category: created.category?.name ?? category.name,
        brand: created.brand ?? data.brand.trim(),
        unit: created.unit,
        stockUnits: created.stockLeft ?? data.stockUnits,
        status: data.status,
        imageUrl: imageUrls[0] ?? getPrimaryFromCreated(created),
      };

      onCreated(product);
      notify.success("Product created", `${product.name} has been added.`);
      onOpenChange(false);
    } catch (error) {
      const responseMessage = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      const message =
        responseMessage ??
        (error instanceof Error ? error.message : "Something went wrong.");
      notify.error(
        message.toLowerCase().includes("sku")
          ? "SKU already exists"
          : "Create failed",
        message,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>
            Add a new product to the central warehouse catalog.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Product Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  id="product-name"
                  placeholder="e.g. UltraTech OPC 53 Cement"
                  {...field}
                />
              )}
            />
            {errors.name ? (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="product-sku">SKU</Label>
              <Controller
                name="sku"
                control={control}
                render={({ field }) => (
                  <Input
                    id="product-sku"
                    placeholder="e.g. UT-OPC-53"
                    className="font-mono uppercase"
                    {...field}
                  />
                )}
              />
              {errors.sku ? (
                <p className="text-xs text-red-500">{errors.sku.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-brand">Brand</Label>
              <Controller
                name="brand"
                control={control}
                render={({ field }) => (
                  <Input
                    id="product-brand"
                    placeholder="e.g. UltraTech"
                    {...field}
                  />
                )}
              />
              {errors.brand ? (
                <p className="text-xs text-red-500">{errors.brand.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category ? (
                <p className="text-xs text-red-500">
                  {errors.category.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_UNIT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.unit ? (
                <p className="text-xs text-red-500">{errors.unit.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="product-stock">Initial Stock</Label>
              <Controller
                name="stockUnits"
                control={control}
                render={({ field }) => (
                  <Input
                    id="product-stock"
                    type="number"
                    min={0}
                    step={1}
                    placeholder="0"
                    value={typeof field.value === "number" ? field.value : 0}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
              {errors.stockUnits ? (
                <p className="text-xs text-red-500">
                  {errors.stockUnits.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (
                        value === "ACTIVE" ||
                        value === "LOW_STOCK" ||
                        value === "INACTIVE"
                      ) {
                        field.onChange(value);
                      }
                    }}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Product Images</Label>
            <MediaUploadGrid images={images} onChange={setImages} />
          </div>

          <DialogFooter className="!mx-0 !mb-0">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getPrimaryFromCreated(created: {
  images?: Array<{ url?: string; isPrimary?: boolean }>;
}): string | undefined {
  const primary = created.images?.find((img) => img.isPrimary)?.url;
  if (primary?.startsWith("http")) return primary;
  const first = created.images?.find((img) => img.url?.startsWith("http"))?.url;
  return first;
}
