"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Eye,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  MousePointerClick,
  Package,
  Tag,
} from "lucide-react";
import Image from "next/image";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OfferMobilePreview } from "@/features/cms/components/OfferMobilePreview";
import { OfferProductSelector } from "@/features/cms/components/OfferProductSelector";
import { PrioritySlider } from "@/features/cms/components/PrioritySlider";
import {
  OFFER_CTA_OPTIONS,
  OFFER_PRODUCT_CATALOG,
  OFFER_TYPE_OPTIONS,
  OFFER_VISIBILITY_OPTIONS,
  slugifyOfferName,
} from "@/features/cms/constants/offer.mock";
import {
  offerFormSchema,
  type OfferFormSchema,
} from "@/features/cms/schema/offer-form.schema";
import {
  createOffer,
  updateOffer,
} from "@/features/cms/services/offer.mock-api";
import type { Offer, OfferProduct } from "@/features/cms/types/offer.types";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

interface OfferFormProps {
  mode: "create" | "edit";
  initialOffer?: Offer;
}

function offerToFormValues(offer: Offer): OfferFormSchema {
  return {
    name: offer.name,
    slug: offer.slug,
    description: offer.description,
    status: offer.status,
    priority: offer.priority,
    offerType: offer.offerType,
    productIds: offer.products.map((product) => product.id),
    ctaLabel: offer.ctaLabel,
    startDate: offer.startDate,
    endDate: offer.endDate,
    visibility: offer.visibility,
    desktopBanner: offer.desktopBanner,
    mobileBanner: offer.mobileBanner,
  };
}

const CREATE_DEFAULTS: OfferFormSchema = {
  name: "",
  slug: "",
  description: "",
  status: "DRAFT",
  priority: 5,
  offerType: "product",
  productIds: [],
  ctaLabel: "Shop Now",
  startDate: "",
  endDate: "",
  visibility: "both",
  desktopBanner: "",
  mobileBanner: "",
};

export function OfferForm({ mode, initialOffer }: OfferFormProps) {
  const router = useRouter();
  const [desktopUpload, setDesktopUpload] = useState<MockUploadFile | null>(
    null,
  );
  const [mobileUpload, setMobileUpload] = useState<MockUploadFile | null>(null);
  const [desktopPreviewUrl, setDesktopPreviewUrl] = useState(
    initialOffer?.desktopBanner ?? "",
  );
  const [mobilePreviewUrl, setMobilePreviewUrl] = useState(
    initialOffer?.mobileBanner ?? "",
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, setValue } = useForm<OfferFormSchema>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: initialOffer
      ? offerToFormValues(initialOffer)
      : CREATE_DEFAULTS,
  });

  const watchedName = watch("name");
  const watchedSlug = watch("slug");
  const watchedCta = watch("ctaLabel");
  const watchedOfferType = watch("offerType");
  const watchedProductIds = watch("productIds");
  const watchedDesktopBanner = watch("desktopBanner");
  const watchedMobileBanner = watch("mobileBanner");

  useEffect(() => {
    if (!slugTouched && mode === "create") {
      setValue("slug", slugifyOfferName(watchedName), {
        shouldValidate: false,
      });
    }
  }, [watchedName, slugTouched, mode, setValue]);

  const selectedProducts = useMemo(() => {
    return watchedProductIds
      .map((id) => OFFER_PRODUCT_CATALOG.find((product) => product.id === id))
      .filter((product): product is OfferProduct => Boolean(product));
  }, [watchedProductIds]);

  const previewBanner =
    mobilePreviewUrl ||
    watchedMobileBanner ||
    desktopPreviewUrl ||
    watchedDesktopBanner ||
    "";

  const handleDesktopFile = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDesktopPreviewUrl(url);
    setValue("desktopBanner", url, { shouldValidate: true });
  };

  const handleMobileFile = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMobilePreviewUrl(url);
    setValue("mobileBanner", url, { shouldValidate: true });
  };

  const onSave = async (data: OfferFormSchema, publish: boolean) => {
    setIsSubmitting(true);
    const payload: OfferFormSchema = {
      ...data,
      status: publish
        ? "ACTIVE"
        : data.status === "ACTIVE"
          ? "ACTIVE"
          : "DRAFT",
      desktopBanner: data.desktopBanner || desktopPreviewUrl,
      mobileBanner: data.mobileBanner || mobilePreviewUrl,
    };

    try {
      if (mode === "edit" && initialOffer) {
        await updateOffer(initialOffer.id, payload);
      } else {
        await createOffer(payload);
      }
      router.push("/customer-app-cms/offers");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit((data) => onSave(data, true))}
      className="space-y-6"
    >
      <Breadcrumbs
        items={[
          { label: "Customer App CMS", href: "/customer-app-cms" },
          { label: "Offer Management", href: "/customer-app-cms/offers" },
          { label: mode === "edit" ? "Edit Offer" : "Create Offer" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            {mode === "edit" ? "Edit Offer" : "Create Offer"}
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Configure banners, product mapping, scheduling, and CTA for the
            customer app.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {mode === "edit" && initialOffer ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 px-4"
              render={
                <Link
                  href={`/customer-app-cms/offers/${initialOffer.id}/preview`}
                />
              }
            >
              <Eye className="size-4" />
              Preview
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-10 px-5"
            disabled={isSubmitting}
            onClick={handleSubmit((data) => onSave(data, false))}
          >
            Save as Draft
          </Button>
          <Button type="submit" className="h-10 px-5" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Publish Offer"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <FormSectionCard icon={FileText} title="Basic Information">
            <div className="space-y-5">
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label htmlFor="offer-name" className={fieldLabelClassName}>
                      Offer Name
                    </Label>
                    <Input
                      {...field}
                      id="offer-name"
                      placeholder="e.g. Monsoon Cement Mega Sale"
                      aria-invalid={!!fieldState.error}
                    />
                    {fieldState.error ? (
                      <p className="text-destructive text-sm">
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="slug"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label htmlFor="offer-slug" className={fieldLabelClassName}>
                      Slug
                    </Label>
                    <Input
                      {...field}
                      id="offer-slug"
                      placeholder="monsoon-cement-mega-sale"
                      aria-invalid={!!fieldState.error}
                      onChange={(event) => {
                        setSlugTouched(true);
                        field.onChange(event.target.value);
                      }}
                    />
                    <p className="text-xs text-[#64748B]">
                      URL path: /offers/{watchedSlug || "your-slug"}
                    </p>
                    {fieldState.error ? (
                      <p className="text-destructive text-sm">
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="description"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="offer-description"
                      className={fieldLabelClassName}
                    >
                      Description
                    </Label>
                    <Textarea
                      {...field}
                      id="offer-description"
                      rows={4}
                      placeholder="Describe the offer for internal reference and customer app copy."
                      aria-invalid={!!fieldState.error}
                    />
                    {fieldState.error ? (
                      <p className="text-destructive text-sm">
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label className={fieldLabelClassName}>Status</Label>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          if (value) field.onChange(value);
                        }}
                      >
                        <SelectTrigger className="h-9 border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                          <SelectItem value="EXPIRED">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />

                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label className={fieldLabelClassName}>Priority</Label>
                      <PrioritySlider
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </FormSectionCard>

          <FormSectionCard icon={ImageIcon} title="Banner Upload">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <Label className={fieldLabelClassName}>Desktop Banner</Label>
                <Controller
                  control={control}
                  name="desktopBanner"
                  render={({ field }) => (
                    <FileDropzone
                      variant="compact"
                      label="Drag & drop desktop banner"
                      helperText="1200×400px · JPG, PNG, WEBP · Max 5MB"
                      accept={{
                        "image/jpeg": [".jpg", ".jpeg"],
                        "image/png": [".png"],
                        "image/webp": [".webp"],
                      }}
                      maxSize={5 * 1024 * 1024}
                      selectedFile={desktopUpload}
                      onFileSelect={setDesktopUpload}
                      onFileChange={(file) => {
                        handleDesktopFile(file);
                        if (!file) field.onChange("");
                      }}
                    />
                  )}
                />
                {desktopPreviewUrl || watchedDesktopBanner ? (
                  <div className="relative aspect-[3/1] overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    <Image
                      src={desktopPreviewUrl || watchedDesktopBanner || ""}
                      alt="Desktop banner preview"
                      fill
                      className="object-cover"
                      sizes="600px"
                      unoptimized={(
                        desktopPreviewUrl ||
                        watchedDesktopBanner ||
                        ""
                      ).startsWith("blob:")}
                    />
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <Label className={fieldLabelClassName}>Mobile Banner</Label>
                <Controller
                  control={control}
                  name="mobileBanner"
                  render={({ field }) => (
                    <FileDropzone
                      variant="compact"
                      label="Drag & drop mobile banner"
                      helperText="800×600px · JPG, PNG, WEBP · Max 5MB"
                      accept={{
                        "image/jpeg": [".jpg", ".jpeg"],
                        "image/png": [".png"],
                        "image/webp": [".webp"],
                      }}
                      maxSize={5 * 1024 * 1024}
                      selectedFile={mobileUpload}
                      onFileSelect={setMobileUpload}
                      onFileChange={(file) => {
                        handleMobileFile(file);
                        if (!file) field.onChange("");
                      }}
                    />
                  )}
                />
                {mobilePreviewUrl || watchedMobileBanner ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    <Image
                      src={mobilePreviewUrl || watchedMobileBanner || ""}
                      alt="Mobile banner preview"
                      fill
                      className="object-cover"
                      sizes="400px"
                      unoptimized={(
                        mobilePreviewUrl ||
                        watchedMobileBanner ||
                        ""
                      ).startsWith("blob:")}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </FormSectionCard>

          <FormSectionCard icon={Tag} title="Offer Type">
            <Controller
              control={control}
              name="offerType"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className={fieldLabelClassName}>Offer Type</Label>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                  >
                    <SelectTrigger className="h-9 max-w-md border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OFFER_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </FormSectionCard>

          <FormSectionCard icon={Package} title="Product Selection">
            <Controller
              control={control}
              name="productIds"
              render={({ field, fieldState }) => (
                <OfferProductSelector
                  selectedIds={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </FormSectionCard>

          <FormSectionCard icon={MousePointerClick} title="CTA Button">
            <Controller
              control={control}
              name="ctaLabel"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className={fieldLabelClassName}>CTA Label</Label>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                  >
                    <SelectTrigger className="h-9 max-w-md border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OFFER_CTA_OPTIONS.map((label) => (
                        <SelectItem key={label} value={label}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </FormSectionCard>

          <FormSectionCard icon={Calendar} title="Scheduling">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Controller
                control={control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label htmlFor="start-date" className={fieldLabelClassName}>
                      Start Date
                    </Label>
                    <Input
                      {...field}
                      id="start-date"
                      type="date"
                      aria-invalid={!!fieldState.error}
                    />
                    {fieldState.error ? (
                      <p className="text-destructive text-sm">
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                control={control}
                name="endDate"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label htmlFor="end-date" className={fieldLabelClassName}>
                      End Date
                    </Label>
                    <Input
                      {...field}
                      id="end-date"
                      type="date"
                      aria-invalid={!!fieldState.error}
                    />
                    {fieldState.error ? (
                      <p className="text-destructive text-sm">
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
            </div>
          </FormSectionCard>

          <FormSectionCard icon={LayoutGrid} title="Visibility">
            <Controller
              control={control}
              name="visibility"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className={fieldLabelClassName}>
                    Where should this offer appear?
                  </Label>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                  >
                    <SelectTrigger className="h-9 max-w-md border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OFFER_VISIBILITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </FormSectionCard>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <OfferMobilePreview
              name={watchedName}
              bannerUrl={previewBanner}
              ctaLabel={watchedCta}
              products={selectedProducts}
              offerType={watchedOfferType}
            />
          </div>
        </aside>
      </div>
    </form>
  );
}
