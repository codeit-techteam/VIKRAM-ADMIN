"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";

import {
  FileDropzone,
  type MockUploadFile,
} from "@/components/shared/FileDropzone";
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
import { Switch } from "@/components/ui/switch";
import { BannerCtaDestinationPicker } from "@/features/cms/components/BannerCtaDestinationPicker";
import { DeliveryPromotionHomePreview } from "@/features/cms/components/DeliveryPromotionHomePreview";
import {
  DELIVERY_PROMOTION_FORM_DEFAULTS,
  DELIVERY_PROMOTION_PLACEMENT,
  deliveryPromotionFormSchema,
  inferDeliveryPromotionCta,
  type DeliveryPromotionFormSchema,
} from "@/features/cms/schema/delivery-promotion-form.schema";
import {
  createDeliveryPromotion,
  updateDeliveryPromotion,
} from "@/features/cms/services/delivery-promotion.api";
import type { DeliveryPromotion } from "@/features/cms/types/delivery-promotion.types";
import {
  assertRemoteMediaUrl,
  uploadMediaFile,
} from "@/services/media.service";
import { notify } from "@/utils/notify";

interface AddDeliveryPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPromotion?: DeliveryPromotion | null;
  onSaved: () => void;
}

const IMAGE_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

function toDatetimeLocalValue(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formStatusFromPromo(
  status: DeliveryPromotion["status"],
): DeliveryPromotionFormSchema["status"] {
  if (status === "DRAFT") return "DRAFT";
  if (status === "INACTIVE" || status === "EXPIRED") return "INACTIVE";
  if (status === "SCHEDULED") return "SCHEDULED";
  return "ACTIVE";
}

function promotionToFormValues(
  promo: DeliveryPromotion,
): DeliveryPromotionFormSchema {
  const cta = inferDeliveryPromotionCta(promo.ctaType, promo.ctaValue);
  return {
    ...DELIVERY_PROMOTION_FORM_DEFAULTS,
    name: promo.name,
    description: promo.description ?? "",
    headline: promo.headline,
    subtitle: promo.subtitle ?? "",
    badge: promo.badge ?? "",
    remainingHeadline: promo.remainingHeadline ?? "",
    exhaustedHeadline: promo.exhaustedHeadline ?? "",
    exhaustedBehavior:
      promo.exhaustedBehavior === "SHOW_ALTERNATE" ? "SHOW_ALTERNATE" : "HIDE",
    status: formStatusFromPromo(promo.status),
    priority: promo.priority || 10,
    targetAudience: promo.targetAudience,
    bannerImage: promo.bannerImage ?? "",
    mobileBannerImage: promo.mobileBannerImage ?? promo.bannerImage ?? "",
    desktopBannerImage: promo.desktopBannerImage ?? "",
    ctaEnabled: promo.ctaEnabled,
    ctaLabel: promo.ctaLabel ?? "Shop Now",
    ...cta,
    startsAt: toDatetimeLocalValue(promo.startsAt),
    endsAt: toDatetimeLocalValue(promo.endsAt),
  };
}

export function AddDeliveryPromotionDialog({
  open,
  onOpenChange,
  editPromotion,
  onSaved,
}: AddDeliveryPromotionDialogProps) {
  const isEdit = Boolean(editPromotion);
  const [isSaving, setIsSaving] = useState(false);
  const [mobileUpload, setMobileUpload] = useState<MockUploadFile | null>(null);
  const [desktopUpload, setDesktopUpload] = useState<MockUploadFile | null>(
    null,
  );
  const [pendingMobileFile, setPendingMobileFile] = useState<File | null>(null);
  const [pendingDesktopFile, setPendingDesktopFile] = useState<File | null>(
    null,
  );
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobileR2Url, setMobileR2Url] = useState<string | null>(null);
  const [desktopR2Url, setDesktopR2Url] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DeliveryPromotionFormSchema>({
    resolver: zodResolver(
      deliveryPromotionFormSchema,
    ) as Resolver<DeliveryPromotionFormSchema>,
    defaultValues: DELIVERY_PROMOTION_FORM_DEFAULTS,
  });

  const headline = useWatch({ control, name: "headline" });
  const subtitle = useWatch({ control, name: "subtitle" });
  const ctaEnabled = useWatch({ control, name: "ctaEnabled" });
  const ctaDestination = useWatch({ control, name: "ctaDestination" });
  const linkType = useWatch({ control, name: "linkType" });
  const ctaPath = useWatch({ control, name: "ctaPath" });
  const ctaTargetLabel = useWatch({ control, name: "ctaTargetLabel" });

  useEffect(() => {
    if (!open) return;
    if (editPromotion) {
      reset(promotionToFormValues(editPromotion));
      const image =
        editPromotion.mobileBannerImage || editPromotion.bannerImage || null;
      setMobilePreview(image);
      setDesktopPreview(editPromotion.desktopBannerImage || null);
      setMobileR2Url(image);
      setDesktopR2Url(editPromotion.desktopBannerImage || null);
    } else {
      reset(DELIVERY_PROMOTION_FORM_DEFAULTS);
      setMobilePreview(null);
      setDesktopPreview(null);
      setMobileR2Url(null);
      setDesktopR2Url(null);
    }
    setPendingMobileFile(null);
    setPendingDesktopFile(null);
    setMobileUpload(null);
    setDesktopUpload(null);
  }, [open, editPromotion, reset]);

  const uploadIfNeeded = async (
    file: File | null,
    currentUrl: string | null,
    replaceKey?: string | null,
    onProgress?: (percent: number) => void,
  ) => {
    if (!file) return currentUrl;
    const uploaded = await uploadMediaFile(file, "delivery-promotions", {
      replaceKey,
      onProgress,
    });
    return uploaded.publicUrl;
  };

  const onSubmit = async (data: DeliveryPromotionFormSchema) => {
    setIsSaving(true);
    try {
      const mobileUrl = await uploadIfNeeded(
        pendingMobileFile,
        mobileR2Url,
        isEdit
          ? editPromotion?.mobileBannerImage || editPromotion?.bannerImage
          : undefined,
        (percent) =>
          setMobileUpload({
            name: pendingMobileFile?.name ?? "mobile",
            progress: percent,
          }),
      );
      const desktopUrl = await uploadIfNeeded(
        pendingDesktopFile,
        desktopR2Url,
        isEdit ? editPromotion?.desktopBannerImage : undefined,
        (percent) =>
          setDesktopUpload({
            name: pendingDesktopFile?.name ?? "desktop",
            progress: percent,
          }),
      );

      const publishing =
        data.status === "ACTIVE" || data.status === "SCHEDULED";
      const resolvedImage = mobileUrl || desktopUrl || data.bannerImage || "";
      if (publishing) {
        assertRemoteMediaUrl(resolvedImage);
      }

      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        headline: data.headline.trim(),
        subtitle: data.subtitle?.trim() || undefined,
        badge: data.badge?.trim() || undefined,
        remainingHeadline: data.remainingHeadline?.trim() || undefined,
        exhaustedHeadline: data.exhaustedHeadline?.trim() || undefined,
        exhaustedBehavior: data.exhaustedBehavior,
        bannerImage: resolvedImage || undefined,
        mobileBannerImage: mobileUrl || resolvedImage || undefined,
        desktopBannerImage: desktopUrl || undefined,
        placement: DELIVERY_PROMOTION_PLACEMENT,
        targetAudience: data.targetAudience,
        status: data.status,
        priority: data.priority,
        ctaEnabled: data.ctaEnabled,
        ctaLabel: data.ctaEnabled ? data.ctaLabel : undefined,
        ctaType: data.ctaEnabled ? data.linkType : "NONE",
        ctaValue: data.ctaEnabled ? data.ctaPath : undefined,
        startsAt: data.startsAt
          ? new Date(data.startsAt).toISOString()
          : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : undefined,
        publish: publishing,
      };

      if (isEdit && editPromotion) {
        await updateDeliveryPromotion(editPromotion.id, payload);
        notify.success("Promotion updated", `${data.name} is saved in CMS.`);
      } else {
        await createDeliveryPromotion(payload);
        notify.success("Promotion created", `${data.name} has been saved.`);
      }
      onSaved();
      onOpenChange(false);
    } catch (error) {
      notify.error(
        isEdit ? "Update failed" : "Create failed",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !isSaving && onOpenChange(next)}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Delivery Promotion" : "Create Delivery Promotion"}
          </DialogTitle>
          <DialogDescription>
            This banner appears below Search on Customer Home. It does not grant
            free delivery — the delivery engine remains the source of truth.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-6 lg:grid-cols-[1fr_320px]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-5">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-[#1A1A1A]">
                Basic information
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="promo-name">Promotion name</Label>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <Input
                        id="promo-name"
                        placeholder="3 Free Bike Deliveries"
                        {...field}
                      />
                    )}
                  />
                  {errors.name ? (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="promo-desc">Internal description</Label>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <Input
                        id="promo-desc"
                        placeholder="Optional — admin notes only"
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-[#1A1A1A]">Status</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Status</Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="promo-priority">
                    Priority (10 = highest)
                  </Label>
                  <Controller
                    control={control}
                    name="priority"
                    render={({ field }) => (
                      <Input
                        id="promo-priority"
                        type="number"
                        min={1}
                        max={100}
                        {...field}
                      />
                    )}
                  />
                  {errors.priority ? (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.priority.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-[#1A1A1A]">
                Banner upload
              </h3>
              <p className="text-xs text-[#64748B]">
                Recommended aspect ratio ~5.9:1 (1024×174). JPG, PNG, or WEBP.
                Do not crop the headline or scooter.
              </p>
              <FileDropzone
                variant="compact"
                label="Mobile banner"
                helperText="JPG, PNG, WEBP · wide strip"
                accept={IMAGE_ACCEPT}
                maxSize={4 * 1024 * 1024}
                selectedFile={mobileUpload}
                previewUrl={mobilePreview}
                onFileChange={(file) => {
                  setPendingMobileFile(file);
                  setMobilePreview(
                    file ? URL.createObjectURL(file) : mobileR2Url,
                  );
                  setMobileUpload(
                    file ? { name: file.name, progress: 0 } : null,
                  );
                }}
                onClear={() => {
                  setPendingMobileFile(null);
                  setMobilePreview(null);
                  setMobileR2Url(null);
                  setMobileUpload(null);
                  setValue("mobileBannerImage", "");
                  setValue("bannerImage", "");
                }}
              />
              {errors.mobileBannerImage ? (
                <p className="text-xs text-red-600">
                  {errors.mobileBannerImage.message}
                </p>
              ) : null}
              <FileDropzone
                variant="compact"
                label="Desktop / web banner (optional)"
                helperText="Used only if a web surface needs a wider crop"
                accept={IMAGE_ACCEPT}
                maxSize={4 * 1024 * 1024}
                selectedFile={desktopUpload}
                previewUrl={desktopPreview}
                onFileChange={(file) => {
                  setPendingDesktopFile(file);
                  setDesktopPreview(
                    file ? URL.createObjectURL(file) : desktopR2Url,
                  );
                  setDesktopUpload(
                    file ? { name: file.name, progress: 0 } : null,
                  );
                }}
                onClear={() => {
                  setPendingDesktopFile(null);
                  setDesktopPreview(null);
                  setDesktopR2Url(null);
                  setDesktopUpload(null);
                  setValue("desktopBannerImage", "");
                }}
              />
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-[#1A1A1A]">
                Promotion text
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="promo-headline">Headline</Label>
                  <Controller
                    control={control}
                    name="headline"
                    render={({ field }) => (
                      <Input
                        id="promo-headline"
                        placeholder="Get 3 FREE Bike deliveries"
                        {...field}
                      />
                    )}
                  />
                  {errors.headline ? (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.headline.message}
                    </p>
                  ) : null}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="promo-sub">Subheadline</Label>
                  <Controller
                    control={control}
                    name="subtitle"
                    render={({ field }) => (
                      <Input
                        id="promo-sub"
                        placeholder="on your first three orders"
                        {...field}
                      />
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="promo-badge">Badge / label</Label>
                  <Controller
                    control={control}
                    name="badge"
                    render={({ field }) => (
                      <Input
                        id="promo-badge"
                        placeholder="FREE DELIVERY"
                        {...field}
                      />
                    )}
                  />
                </div>
                <div>
                  <Label>Audience</Label>
                  <Controller
                    control={control}
                    name="targetAudience"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All customers</SelectItem>
                          <SelectItem value="NEW_CUSTOMERS">
                            New customers
                          </SelectItem>
                          <SelectItem value="FREE_BIKE_REMAINING">
                            Free bike remaining
                          </SelectItem>
                          <SelectItem value="FREE_BIKE_EXHAUSTED">
                            Free bike used up
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="promo-remaining">Remaining headline</Label>
                  <Controller
                    control={control}
                    name="remainingHeadline"
                    render={({ field }) => (
                      <Input
                        id="promo-remaining"
                        placeholder="{count} FREE Bike {delivery} remaining"
                        {...field}
                      />
                    )}
                  />
                  <p className="mt-1 text-[11px] text-[#64748B]">
                    Shown when the customer has used some, but not all, free
                    bike deliveries. Use {"{count}"} and {"{delivery}"}.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1A1A1A]">CTA</h3>
                <Controller
                  control={control}
                  name="ctaEnabled"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Label htmlFor="cta-enabled" className="text-xs">
                        CTA enabled
                      </Label>
                      <Switch
                        id="cta-enabled"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>
              {ctaEnabled ? (
                <>
                  <div>
                    <Label htmlFor="cta-label">CTA label</Label>
                    <Controller
                      control={control}
                      name="ctaLabel"
                      render={({ field }) => (
                        <Input
                          id="cta-label"
                          placeholder="Shop Now"
                          {...field}
                        />
                      )}
                    />
                    {errors.ctaLabel ? (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.ctaLabel.message}
                      </p>
                    ) : null}
                  </div>
                  <BannerCtaDestinationPicker
                    value={{
                      ctaDestination,
                      linkType: linkType ?? "ROUTE",
                      ctaPath: ctaPath ?? "",
                      ctaTargetLabel,
                    }}
                    onChange={(next) => {
                      setValue("ctaDestination", next.ctaDestination);
                      setValue("linkType", next.linkType);
                      setValue("ctaPath", next.ctaPath);
                      setValue("ctaTargetLabel", next.ctaTargetLabel);
                    }}
                    error={errors.ctaPath?.message}
                  />
                </>
              ) : (
                <p className="text-xs text-[#64748B]">
                  Banner is informational. Customers will not be taken to
                  another screen.
                </p>
              )}
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="promo-start">Start</Label>
                <Controller
                  control={control}
                  name="startsAt"
                  render={({ field }) => (
                    <Input id="promo-start" type="datetime-local" {...field} />
                  )}
                />
                {errors.startsAt ? (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.startsAt.message}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="promo-end">End</Label>
                <Controller
                  control={control}
                  name="endsAt"
                  render={({ field }) => (
                    <Input id="promo-end" type="datetime-local" {...field} />
                  )}
                />
                {errors.endsAt ? (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.endsAt.message}
                  </p>
                ) : null}
              </div>
            </section>
          </div>

          <div className="lg:sticky lg:top-0">
            <p className="mb-3 text-xs font-semibold tracking-wide text-[#64748B] uppercase">
              Preview on Customer App
            </p>
            <DeliveryPromotionHomePreview
              imageUrl={mobilePreview}
              headline={headline}
              subtitle={subtitle}
            />
          </div>

          <DialogFooter className="lg:col-span-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create promotion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
