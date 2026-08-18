"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";

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
import { BannerCtaDestinationPicker } from "@/features/cms/components/BannerCtaDestinationPicker";
import { BannerMobilePreview } from "@/features/cms/components/BannerMobilePreview";
import {
  BANNER_FORM_DEFAULT_VALUES,
  BANNER_PLACEMENT_LABELS,
  BANNER_PLACEMENTS,
  bannerFormSchema,
  inferBannerCtaDestination,
  normalizeBannerPlacement,
  type BannerFormSchema,
} from "@/features/cms/schema/banner-form.schema";
import {
  createBanner,
  updateBanner,
} from "@/features/cms/services/banner.mock-api";
import type { Banner } from "@/features/cms/types/banner.types";
import { getApiErrorMessage } from "@/services/api";
import {
  assertRemoteMediaUrl,
  uploadMediaFile,
} from "@/services/media.service";
import { notify } from "@/utils/notify";

interface AddBannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editBanner?: Banner | null;
  onSaved: () => void;
}

function toDatetimeLocalValue(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function firstErrorMessage(errors: FieldErrors<BannerFormSchema>): string {
  return (
    errors.title?.message ||
    errors.mobileUrl?.message ||
    errors.imageUrl?.message ||
    errors.ctaPath?.message ||
    errors.ctaDestination?.message ||
    errors.endsAt?.message ||
    errors.location?.message ||
    errors.priority?.message ||
    errors.status?.message ||
    "Please fix the highlighted fields."
  );
}

function formStatusFromBanner(
  status: Banner["status"],
): BannerFormSchema["status"] {
  if (status === "DRAFT") return "DRAFT";
  if (status === "INACTIVE") return "INACTIVE";
  return "ACTIVE";
}

function bannerToFormValues(banner: Banner): BannerFormSchema {
  const cta = inferBannerCtaDestination(banner.linkType, banner.ctaPath);
  return {
    ...BANNER_FORM_DEFAULT_VALUES,
    name: banner.name ?? "",
    description: banner.description ?? "",
    title: banner.title,
    subtitle: banner.subtitle ?? "",
    location: normalizeBannerPlacement(banner.location),
    placement: normalizeBannerPlacement(banner.location),
    ctaLabel: banner.ctaLabel ?? "",
    ...cta,
    badge: banner.badge ?? "",
    ctaColor: banner.ctaColor ?? "",
    backgroundColor: banner.backgroundColor ?? "",
    imageUrl:
      banner.imageUrl ||
      banner.mobileUrl ||
      banner.desktopUrl ||
      banner.thumbnailUrl ||
      "",
    mobileUrl:
      banner.mobileUrl ||
      banner.imageUrl ||
      banner.thumbnailUrl ||
      banner.desktopUrl ||
      "",
    desktopUrl: banner.desktopUrl ?? "",
    priority: banner.priority || 1,
    targetAudience: banner.targetAudience ?? "ALL",
    startsAt: toDatetimeLocalValue(banner.startsAt),
    endsAt: toDatetimeLocalValue(banner.endsAt),
    status: formStatusFromBanner(banner.status),
  };
}

export function AddBannerDialog({
  open,
  onOpenChange,
  editBanner,
  onSaved,
}: AddBannerDialogProps) {
  const isEdit = Boolean(editBanner);
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
  } = useForm<BannerFormSchema>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: BANNER_FORM_DEFAULT_VALUES,
    mode: "onSubmit",
  });

  const ctaDestination = useWatch({ control, name: "ctaDestination" });
  const linkType = useWatch({ control, name: "linkType" });
  const ctaPath = useWatch({ control, name: "ctaPath" });
  const ctaTargetLabel = useWatch({ control, name: "ctaTargetLabel" });
  const title = useWatch({ control, name: "title" });
  const subtitle = useWatch({ control, name: "subtitle" });
  const badge = useWatch({ control, name: "badge" });
  const ctaLabel = useWatch({ control, name: "ctaLabel" });
  const backgroundColor = useWatch({ control, name: "backgroundColor" });
  const ctaColor = useWatch({ control, name: "ctaColor" });
  const location = useWatch({ control, name: "location" });
  const isHeroBanner = location === "HOME_HERO";

  useEffect(() => {
    if (!open) return;

    if (editBanner) {
      reset(bannerToFormValues(editBanner));
      setMobilePreview(
        editBanner.mobileUrl ||
          editBanner.imageUrl ||
          editBanner.thumbnailUrl,
      );
      setDesktopPreview(editBanner.desktopUrl || null);
      setMobileR2Url(
        editBanner.mobileUrl ||
          editBanner.imageUrl ||
          editBanner.thumbnailUrl ||
          null,
      );
      setDesktopR2Url(editBanner.desktopUrl || null);
      setPendingMobileFile(null);
      setPendingDesktopFile(null);
      setMobileUpload(null);
      setDesktopUpload(null);
    } else {
      reset(BANNER_FORM_DEFAULT_VALUES);
      setMobilePreview(null);
      setDesktopPreview(null);
      setMobileR2Url(null);
      setDesktopR2Url(null);
      setPendingMobileFile(null);
      setPendingDesktopFile(null);
      setMobileUpload(null);
      setDesktopUpload(null);
    }
  }, [open, editBanner, reset]);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && isSaving) return;
    onOpenChange(nextOpen);
  };

  const uploadIfNeeded = async (
    file: File | null,
    currentUrl: string | null,
    replaceKey?: string | null,
    onProgress?: (percent: number) => void,
  ) => {
    if (!file) return currentUrl;
    const uploaded = await uploadMediaFile(file, "banners", {
      replaceKey,
      onProgress,
    });
    return uploaded.publicUrl;
  };

  const onSubmit = async (data: BannerFormSchema) => {
    setIsSaving(true);
    try {
      const mobileUrl = await uploadIfNeeded(
        pendingMobileFile,
        mobileR2Url,
        isEdit ? editBanner?.mobileUrl || editBanner?.thumbnailUrl : undefined,
        (percent) =>
          setMobileUpload({
            name: pendingMobileFile?.name ?? "mobile",
            progress: percent,
          }),
      );
      const desktopUrl = await uploadIfNeeded(
        pendingDesktopFile,
        desktopR2Url,
        isEdit ? editBanner?.desktopUrl : undefined,
        (percent) =>
          setDesktopUpload({
            name: pendingDesktopFile?.name ?? "desktop",
            progress: percent,
          }),
      );

      const publishing = data.status === "ACTIVE";
      const resolvedImageUrl = mobileUrl || desktopUrl || data.imageUrl || "";
      const isLocalPreview =
        resolvedImageUrl.startsWith("blob:") ||
        resolvedImageUrl.startsWith("data:");
      if (resolvedImageUrl && !isLocalPreview) {
        assertRemoteMediaUrl(resolvedImageUrl);
      } else if (publishing && (isLocalPreview || !resolvedImageUrl)) {
        throw new Error(
          isHeroBanner
            ? "Upload a full hero banner image before publishing. It fills the home carousel in the app."
            : "Upload a banner image before publishing.",
        );
      }

      const remoteImage = isLocalPreview ? "" : resolvedImageUrl;
      const payload: BannerFormSchema = {
        ...data,
        placement: data.location || data.placement,
        imageUrl: remoteImage,
        mobileUrl: remoteImage
          ? mobileUrl || desktopUrl || remoteImage
          : "",
        desktopUrl: desktopUrl && !desktopUrl.startsWith("blob:") ? desktopUrl : "",
        badge: data.badge?.trim() || "",
        ctaColor: data.ctaColor?.trim() || "",
        backgroundColor: data.backgroundColor?.trim() || "",
      };

      if (isEdit && editBanner) {
        await updateBanner(editBanner.id, payload, remoteImage || undefined);
        notify.success("Banner updated", `${data.title} is live in CMS.`);
      } else {
        await createBanner(payload, remoteImage || undefined);
        notify.success("Banner created", `${data.title} has been saved.`);
      }
      onSaved();
      onOpenChange(false);
    } catch (error) {
      notify.error(
        isEdit ? "Update failed" : "Create failed",
        getApiErrorMessage(error),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const syncImageFields = () => {
    const existing =
      mobileR2Url ||
      desktopR2Url ||
      editBanner?.mobileUrl ||
      editBanner?.imageUrl ||
      editBanner?.desktopUrl ||
      editBanner?.thumbnailUrl ||
      "";
    const preview = pendingMobileFile
      ? mobilePreview
      : pendingDesktopFile
        ? desktopPreview
        : existing;
    if (preview) {
      setValue("mobileUrl", preview, { shouldValidate: false });
      if (existing && !existing.startsWith("blob:")) {
        setValue("imageUrl", existing, { shouldValidate: false });
      }
    }
    setValue("placement", location || "HOME_PROMO", { shouldValidate: false });
  };

  const onInvalid = (formErrors: FieldErrors<BannerFormSchema>) => {
    notify.error("Can't save banner", firstErrorMessage(formErrors));
    const targetId = formErrors.title
      ? "banner-title"
      : formErrors.mobileUrl
        ? "banner-mobile-image"
        : formErrors.ctaPath
          ? "banner-cta"
          : formErrors.endsAt
            ? "banner-ends"
            : undefined;
    if (targetId) {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const saveBanner = () => {
    syncImageFields();
    void handleSubmit(onSubmit, onInvalid)();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="shrink-0 px-4 pt-4 pr-12">
          <DialogTitle>
            {isHeroBanner
              ? isEdit
                ? "Edit hero banner"
                : "Create hero banner"
              : isEdit
                ? "Edit promotional banner"
                : "Create promotional banner"}
          </DialogTitle>
          <DialogDescription>
            {isHeroBanner
              ? "Hero banners are the full-bleed home carousel. Upload complete banner artwork — it fills the card edge-to-edge in the app."
              : "Home promo banners are composed on the app: title, offer, badge, and CTA come from this form. Upload a product or illustration — it shows fully visible on the right."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveBanner();
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="banner-name">Banner name</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="banner-name"
                      placeholder={
                        isHeroBanner
                          ? "WaterProof Today"
                          : "3 Free Bike Deliveries"
                      }
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Placement</Label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value: string) => {
                        if (!value) return;
                        field.onChange(value);
                        setValue("placement", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select placement" />
                      </SelectTrigger>
                      <SelectContent>
                        {BANNER_PLACEMENTS.map((placement) => (
                          <SelectItem key={placement} value={placement}>
                            {BANNER_PLACEMENT_LABELS[placement]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div id="banner-mobile-image" className="space-y-1.5">
                <Label>
                  {isHeroBanner ? "Hero banner image" : "Mobile banner image"}
                </Label>
                <FileDropzone
                  variant="compact"
                  label={
                    isHeroBanner
                      ? "Upload full hero banner"
                      : "Upload mobile image"
                  }
                  helperText={
                    isHeroBanner
                      ? "Complete artwork · JPG/PNG/WebP · shown edge-to-edge, not as product art"
                      : "Product or illustration on the right · JPG/PNG/WebP · shown fully, not cropped"
                  }
                  accept={{
                    "image/jpeg": [".jpg", ".jpeg"],
                    "image/png": [".png"],
                    "image/webp": [".webp"],
                  }}
                  maxSize={5 * 1024 * 1024}
                  selectedFile={mobileUpload}
                  previewUrl={mobilePreview}
                  onFileSelect={setMobileUpload}
                  onFileChange={(file) => {
                    if (mobilePreview?.startsWith("blob:")) {
                      URL.revokeObjectURL(mobilePreview);
                    }
                    if (!file) {
                      setPendingMobileFile(null);
                      setMobilePreview(mobileR2Url);
                      setValue("mobileUrl", mobileR2Url ?? "");
                      return;
                    }
                    const next = URL.createObjectURL(file);
                    setPendingMobileFile(file);
                    setMobilePreview(next);
                    setMobileUpload({ name: file.name, progress: 0 });
                    setValue("mobileUrl", next, { shouldValidate: true });
                  }}
                  onClear={() => {
                    if (mobilePreview?.startsWith("blob:")) {
                      URL.revokeObjectURL(mobilePreview);
                    }
                    setPendingMobileFile(null);
                    setMobilePreview(mobileR2Url);
                    setMobileUpload(null);
                    setValue("mobileUrl", mobileR2Url ?? "");
                  }}
                />
                {errors.mobileUrl ? (
                  <p className="text-xs text-red-500">
                    {errors.mobileUrl.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label>Desktop banner image</Label>
                <FileDropzone
                  variant="compact"
                  label="Upload desktop image"
                  helperText={
                    isHeroBanner
                      ? "Optional · used if the hero image above is empty"
                      : "Optional · used if mobile image is empty"
                  }
                  accept={{
                    "image/jpeg": [".jpg", ".jpeg"],
                    "image/png": [".png"],
                    "image/webp": [".webp"],
                  }}
                  maxSize={5 * 1024 * 1024}
                  selectedFile={desktopUpload}
                  previewUrl={desktopPreview}
                  onFileSelect={setDesktopUpload}
                  onFileChange={(file) => {
                    if (desktopPreview?.startsWith("blob:")) {
                      URL.revokeObjectURL(desktopPreview);
                    }
                    if (!file) {
                      setPendingDesktopFile(null);
                      setDesktopPreview(desktopR2Url);
                      setValue("desktopUrl", desktopR2Url ?? "");
                      return;
                    }
                    const next = URL.createObjectURL(file);
                    setPendingDesktopFile(file);
                    setDesktopPreview(next);
                    setDesktopUpload({ name: file.name, progress: 0 });
                    setValue("desktopUrl", next, { shouldValidate: true });
                  }}
                  onClear={() => {
                    if (desktopPreview?.startsWith("blob:")) {
                      URL.revokeObjectURL(desktopPreview);
                    }
                    setPendingDesktopFile(null);
                    setDesktopPreview(desktopR2Url);
                    setDesktopUpload(null);
                    setValue("desktopUrl", desktopR2Url ?? "");
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="banner-description">Internal description</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input
                    id="banner-description"
                    placeholder="First 3 eligible bike deliveries promotion"
                    {...field}
                  />
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="banner-title">
                {isHeroBanner ? "Banner title" : "Headline on the app"}
              </Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    id="banner-title"
                    placeholder={
                      isHeroBanner
                        ? "WaterProof Today"
                        : "BULK ORDER | BIGGER SAVINGS!"
                    }
                    {...field}
                  />
                )}
              />
              <p className="text-[11px] text-[#64748B]">
                {isHeroBanner
                  ? "Used in the admin list and for accessibility. Customers see the uploaded image."
                  : "Use | to split the headline, e.g. BULK ORDER | BIGGER SAVINGS!"}
              </p>
              {errors.title ? (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              ) : null}
            </div>

            {!isHeroBanner ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="banner-subtitle">Subtitle</Label>
                  <Controller
                    name="subtitle"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="banner-subtitle"
                        placeholder="Quality you trust, strength you build on."
                        {...field}
                      />
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="banner-badge">Badge</Label>
                    <Controller
                      name="badge"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="banner-badge"
                          placeholder="Ideal for contractors"
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="banner-cta-label">CTA label</Label>
                    <Controller
                      name="ctaLabel"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="banner-cta-label"
                          placeholder="Shop Now"
                          {...field}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Background</Label>
                    <Controller
                      name="backgroundColor"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-wrap items-center gap-2">
                          {["#FFF6E8", "#FFE082", "#FFD7A8", "#FFFFFF"].map(
                            (color) => (
                              <button
                                key={color}
                                type="button"
                                aria-label={color}
                                onClick={() => field.onChange(color)}
                                className="size-7 rounded-full border border-black/10"
                                style={{
                                  backgroundColor: color,
                                  outline:
                                    field.value === color
                                      ? "2px solid #111111"
                                      : undefined,
                                  outlineOffset: 2,
                                }}
                              />
                            ),
                          )}
                          <Input
                            className="h-9 w-28"
                            placeholder="#FFF6E8"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </div>
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CTA color</Label>
                    <Controller
                      name="ctaColor"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-wrap items-center gap-2">
                          {["#111111", "#C62828", "#FFFFFF"].map((color) => (
                            <button
                              key={color}
                              type="button"
                              aria-label={color}
                              onClick={() => field.onChange(color)}
                              className="size-7 rounded-full border border-black/10"
                              style={{
                                backgroundColor: color,
                                outline:
                                  field.value === color
                                    ? "2px solid #111111"
                                    : undefined,
                                outlineOffset: 2,
                              }}
                            />
                          ))}
                          <Input
                            className="h-9 w-28"
                            placeholder="#111111"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>
              </>
            ) : null}

            <p className="text-[11px] text-[#64748B]">
              {isHeroBanner
                ? "Tapping the hero banner in the app opens this destination."
                : "Tapping the banner on the app opens this destination."}
            </p>
            <div id="banner-cta">
              <BannerCtaDestinationPicker
                value={{
                  ctaDestination: ctaDestination || "CATALOG",
                  linkType: linkType || "ROUTE",
                  ctaPath: ctaPath || "",
                  ctaTargetLabel: ctaTargetLabel || "",
                }}
                onChange={(next) => {
                  setValue("ctaDestination", next.ctaDestination, {
                    shouldValidate: true,
                  });
                  setValue("linkType", next.linkType, { shouldValidate: true });
                  setValue("ctaPath", next.ctaPath, { shouldValidate: true });
                  setValue("ctaTargetLabel", next.ctaTargetLabel || "", {
                    shouldValidate: true,
                  });

                  const remoteImage = next.previewImageUrl?.trim() || "";
                  const isRemote =
                    remoteImage.startsWith("http://") ||
                    remoteImage.startsWith("https://");
                  if (
                    !isHeroBanner &&
                    isRemote &&
                    !pendingMobileFile &&
                    !mobileR2Url
                  ) {
                    setMobilePreview(remoteImage);
                    setMobileR2Url(remoteImage);
                    setValue("imageUrl", remoteImage, { shouldValidate: true });
                    setValue("mobileUrl", remoteImage, { shouldValidate: true });
                  }
                }}
                error={errors.ctaPath?.message}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="banner-starts">Start date</Label>
                <Controller
                  name="startsAt"
                  control={control}
                  render={({ field }) => (
                    <Input id="banner-starts" type="datetime-local" {...field} />
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="banner-ends">End date</Label>
                <Controller
                  name="endsAt"
                  control={control}
                  render={({ field }) => (
                    <Input id="banner-ends" type="datetime-local" {...field} />
                  )}
                />
                {errors.endsAt ? (
                  <p className="text-xs text-red-500">{errors.endsAt.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value: string) => {
                        if (
                          value === "ACTIVE" ||
                          value === "DRAFT" ||
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
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="banner-priority">Priority</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="banner-priority"
                      type="number"
                      min={1}
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value) || 1)
                      }
                    />
                  )}
                />
                <p className="text-[11px] text-[#64748B]">1 = highest</p>
              </div>
              <div className="space-y-1.5">
                <Label>Target audience</Label>
                <Controller
                  name="targetAudience"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value: string) => {
                        if (value) field.onChange(value);
                      }}
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All customers</SelectItem>
                        <SelectItem value="NEW_CUSTOMERS">
                          New customers
                        </SelectItem>
                        <SelectItem value="FREE_BIKE_REMAINING">
                          Remaining free bike deliveries
                        </SelectItem>
                        <SelectItem value="FREE_BIKE_EXHAUSTED">
                          0 remaining free bike deliveries
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          <div>
            <BannerMobilePreview
              variant={isHeroBanner ? "hero" : "promo"}
              title={title}
              subtitle={subtitle}
              badge={badge}
              ctaLabel={ctaLabel}
              backgroundColor={backgroundColor}
              ctaColor={ctaColor}
              imageUrl={
                mobilePreview ||
                desktopPreview ||
                editBanner?.mobileUrl ||
                editBanner?.imageUrl ||
                editBanner?.thumbnailUrl
              }
            />
          </div>
            </div>
          </div>

          <DialogFooter className="relative z-20 mx-0 mb-0 shrink-0 rounded-none border-t bg-white">
            {Object.keys(errors).length > 0 ? (
              <p className="mr-auto text-xs text-red-500">
                {firstErrorMessage(errors)}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              nativeButton
              disabled={isSaving}
              onClick={saveBanner}
            >
              {isSaving ? "Saving..." : "Save banner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
