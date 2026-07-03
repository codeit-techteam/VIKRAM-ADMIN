"use client";

import Image from "next/image";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { SkuTable } from "@/components/inventory/material/SkuTable";
import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Badge } from "@/components/ui/badge";
import { getCategoryLabel } from "@/mock/categories";
import { WAREHOUSE_OPTIONS } from "@/mock/materials";
import type { MaterialFormSchema } from "@/schema/material-form.schema";

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-50 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between">
      <dt className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
        {label}
      </dt>
      <dd className="text-sm font-medium text-[#1A1A1A] sm:max-w-[60%] sm:text-right">
        {value || "—"}
      </dd>
    </div>
  );
}

function formatCurrency(value: number) {
  if (value <= 0) return "—";
  return `₹${value.toLocaleString("en-IN")}`;
}

export function MaterialReview() {
  const { watch } = useFormContext<MaterialFormSchema>();
  const data = watch();

  const warehouseLabel =
    WAREHOUSE_OPTIONS.find((option) => option.value === data.warehouse)
      ?.label ?? data.warehouse;

  return (
    <div className="space-y-5">
      <FormSectionCard icon={ClipboardList} title="Review & Publish">
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-3">
          <CheckCircle2 className="size-5 text-emerald-600" />
          <p className="text-sm text-emerald-800">
            Review all details before publishing this material to Central
            Warehouse inventory.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className="rounded-lg border border-gray-100 p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#1A1A1A]">
              Material Details
            </h3>
            <dl>
              <SummaryRow label="Material Name" value={data.materialName} />
              <SummaryRow
                label="Display Name"
                value={data.productDisplayName}
              />
              <SummaryRow label="Brand" value={data.brand} />
              <SummaryRow label="Manufacturer" value={data.manufacturer} />
              <SummaryRow label="HSN Code" value={data.hsnCode} />
              <SummaryRow
                label="GST %"
                value={data.gstPercent > 0 ? `${data.gstPercent}%` : "—"}
              />
              <SummaryRow
                label="Status"
                value={
                  <Badge variant="secondary" className="capitalize">
                    {data.productStatus}
                  </Badge>
                }
              />
              <SummaryRow
                label="Short Description"
                value={data.shortDescription}
              />
            </dl>
          </section>

          <section className="rounded-lg border border-gray-100 p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#1A1A1A]">
              Category
            </h3>
            <dl>
              <SummaryRow
                label="Category"
                value={getCategoryLabel(data.category)}
              />
              <SummaryRow label="Sub Category" value={data.subCategory} />
              <SummaryRow
                label="Tags"
                value={
                  data.tags.length > 0 ? (
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {data.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    "—"
                  )
                }
              />
              <SummaryRow label="Search Keywords" value={data.searchKeywords} />
            </dl>
          </section>

          <section className="rounded-lg border border-gray-100 p-4 xl:col-span-2">
            <h3 className="mb-3 text-sm font-semibold text-[#1A1A1A]">
              SKUs ({data.skus.length})
            </h3>
            <SkuTable skus={data.skus} readOnly />
          </section>

          <section className="rounded-lg border border-gray-100 p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#1A1A1A]">
              Pricing
            </h3>
            <dl>
              <SummaryRow
                label="Purchase Price"
                value={formatCurrency(data.purchasePrice)}
              />
              <SummaryRow
                label="Selling Price"
                value={formatCurrency(data.sellingPrice)}
              />
              <SummaryRow
                label="Dealer Price"
                value={formatCurrency(data.dealerPrice)}
              />
              <SummaryRow
                label="Bulk Price"
                value={formatCurrency(data.bulkPrice)}
              />
              <SummaryRow
                label="Discount"
                value={
                  data.discountPercent > 0 ? `${data.discountPercent}%` : "—"
                }
              />
              <SummaryRow
                label="GST Included"
                value={data.gstIncluded ? "Yes" : "No"}
              />
            </dl>
          </section>

          <section className="rounded-lg border border-gray-100 p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#1A1A1A]">
              Warehouse
            </h3>
            <dl>
              <SummaryRow label="Warehouse" value={warehouseLabel} />
              <SummaryRow
                label="Default Location"
                value={data.defaultLocation}
              />
              <SummaryRow
                label="Rack / Bin / Shelf"
                value={[data.rackNumber, data.binNumber, data.shelfNumber]
                  .filter(Boolean)
                  .join(" / ")}
              />
              <SummaryRow
                label="Opening Stock"
                value={data.openingStock.toLocaleString("en-IN")}
              />
              <SummaryRow
                label="Reorder Level"
                value={data.reorderLevel.toLocaleString("en-IN")}
              />
              <SummaryRow
                label="Inventory Tracking"
                value={data.allowInventoryTracking === "yes" ? "Yes" : "No"}
              />
            </dl>
          </section>

          <section className="rounded-lg border border-gray-100 p-4 xl:col-span-2">
            <h3 className="mb-3 text-sm font-semibold text-[#1A1A1A]">
              Images
            </h3>
            <div className="flex flex-wrap gap-3">
              {data.mainImage && (
                <div className="relative size-24 overflow-hidden rounded-lg border border-gray-100">
                  <Image
                    src={data.mainImage.url}
                    alt={data.mainImage.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <span className="bg-primary absolute top-1 left-1 rounded px-1 py-0.5 text-[8px] font-bold text-white uppercase">
                    Main
                  </span>
                </div>
              )}
              {data.galleryImages.map((image) => (
                <div
                  key={image.id}
                  className="relative size-24 overflow-hidden rounded-lg border border-gray-100"
                >
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
              {!data.mainImage && data.galleryImages.length === 0 && (
                <p className="text-sm text-gray-400">No images uploaded</p>
              )}
            </div>
          </section>
        </div>
      </FormSectionCard>
    </div>
  );
}
