"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

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
import {
  BANNER_FORM_DEFAULT_VALUES,
  bannerFormSchema,
  type BannerFormSchema,
} from "@/features/cms/schema/banner-form.schema";
import {
  createBanner,
  updateBanner,
} from "@/features/cms/services/banner.mock-api";
import type { Banner } from "@/features/cms/types/banner.types";
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

function bannerToFormValues(banner: Banner): BannerFormSchema {
  return {
    title: banner.title,
    location: banner.location,
    ctaLabel: banner.ctaLabel,
    ctaPath: banner.ctaPath,
    status: banner.status,
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
  const [imageUpload, setImageUpload] = useState<MockUploadFile | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [r2ImageUrl, setR2ImageUrl] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BannerFormSchema>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: BANNER_FORM_DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) return;

    if (editBanner) {
      reset(bannerToFormValues(editBanner));
      setPreviewUrl(editBanner.thumbnailUrl);
      setR2ImageUrl(editBanner.thumbnailUrl || null);
      setPendingImageFile(null);
      setImageUpload(null);
    } else {
      reset(BANNER_FORM_DEFAULT_VALUES);
      setPreviewUrl(null);
      setR2ImageUrl(null);
      setPendingImageFile(null);
      setImageUpload(null);
    }
  }, [open, editBanner, reset]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && isSaving) return;
    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: BannerFormSchema) => {
    setIsSaving(true);
    try {
      let imageUrl = r2ImageUrl;

      if (pendingImageFile) {
        setImageUpload({
          name: pendingImageFile.name,
          progress: 0,
        });
        const uploaded = await uploadMediaFile(pendingImageFile, "banners", {
          replaceKey: isEdit ? editBanner?.thumbnailUrl : undefined,
          onProgress: (percent) => {
            setImageUpload({
              name: pendingImageFile.name,
              progress: percent,
            });
          },
        });
        imageUrl = uploaded.publicUrl;
        setR2ImageUrl(uploaded.publicUrl);
        setPreviewUrl(uploaded.publicUrl);
        setPendingImageFile(null);
      }

      if (!isEdit) {
        assertRemoteMediaUrl(imageUrl);
      }

      if (isEdit && editBanner) {
        await updateBanner(editBanner.id, data, imageUrl ?? undefined);
        notify.success("Banner updated", `${data.title} has been saved.`);
      } else {
        await createBanner(data, assertRemoteMediaUrl(imageUrl));
        notify.success("Banner created", `${data.title} has been added.`);
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Banner" : "Add Banner"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update campaign details, CTA redirect, and status."
              : "Create a new customer app banner with targeting and CTA."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="banner-title">Campaign Title</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  id="banner-title"
                  placeholder="e.g. Monsoon Cement Sale"
                  {...field}
                />
              )}
            />
            {errors.title ? (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>Placement</Label>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOME_HERO">Hero Banner</SelectItem>
                    <SelectItem value="HOME_PROMO">Home Promo</SelectItem>
                    <SelectItem value="EMERGENCY_DELIVERY">
                      Emergency Delivery
                    </SelectItem>
                    <SelectItem value="BULK_PROCUREMENT">
                      Bulk Procurement
                    </SelectItem>
                    <SelectItem value="CATEGORY">Category</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.location ? (
              <p className="text-xs text-red-500">{errors.location.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="banner-subtitle">Subtitle</Label>
            <Controller
              name="subtitle"
              control={control}
              render={({ field }) => (
                <Input
                  id="banner-subtitle"
                  placeholder="e.g. Bulk Cement Offers"
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="banner-starts">Start Date</Label>
              <Controller
                name="startsAt"
                control={control}
                render={({ field }) => (
                  <Input id="banner-starts" type="datetime-local" {...field} />
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="banner-ends">End Date</Label>
              <Controller
                name="endsAt"
                control={control}
                render={({ field }) => (
                  <Input id="banner-ends" type="datetime-local" {...field} />
                )}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="banner-cta-label">CTA Label</Label>
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
              {errors.ctaLabel ? (
                <p className="text-xs text-red-500">
                  {errors.ctaLabel.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="banner-cta-path">Redirect Path</Label>
              <Controller
                name="ctaPath"
                control={control}
                render={({ field }) => (
                  <Input
                    id="banner-cta-path"
                    placeholder="/category/cement"
                    {...field}
                  />
                )}
              />
              {errors.ctaPath ? (
                <p className="text-xs text-red-500">{errors.ctaPath.message}</p>
              ) : null}
            </div>
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
                    if (value === "LIVE" || value === "DRAFT") {
                      field.onChange(value);
                    }
                  }}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIVE">Live</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Banner Image</Label>
            <FileDropzone
              variant="compact"
              label="Upload banner image"
              helperText="JPG or PNG, recommended 1200×400"
              accept={{
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
                "image/webp": [".webp"],
              }}
              maxSize={5 * 1024 * 1024}
              selectedFile={imageUpload}
              previewUrl={previewUrl}
              onFileSelect={setImageUpload}
              onFileChange={(file) => {
                if (previewUrl?.startsWith("blob:")) {
                  URL.revokeObjectURL(previewUrl);
                }
                if (!file) {
                  setPendingImageFile(null);
                  setPreviewUrl(r2ImageUrl ?? editBanner?.thumbnailUrl ?? null);
                  return;
                }
                setPendingImageFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                setImageUpload({ name: file.name, progress: 0 });
              }}
              onClear={() => {
                if (previewUrl?.startsWith("blob:")) {
                  URL.revokeObjectURL(previewUrl);
                }
                setPendingImageFile(null);
                setPreviewUrl(r2ImageUrl ?? editBanner?.thumbnailUrl ?? null);
                setImageUpload(null);
              }}
            />
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
              {isSaving
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save Changes"
                  : "Create Banner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
