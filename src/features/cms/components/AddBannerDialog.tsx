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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      setImageUpload(null);
    } else {
      reset(BANNER_FORM_DEFAULT_VALUES);
      setPreviewUrl(null);
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
      if (isEdit && editBanner) {
        await updateBanner(editBanner.id, data, previewUrl ?? undefined);
        notify.success("Banner updated", `${data.title} has been saved.`);
      } else {
        await createBanner(data, previewUrl ?? undefined);
        notify.success("Banner created", `${data.title} has been added.`);
      }
      onSaved();
      onOpenChange(false);
    } catch {
      notify.error(
        isEdit ? "Update failed" : "Create failed",
        "Something went wrong. Please try again.",
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
            <Label htmlFor="banner-location">Location / Targeting</Label>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <Input
                  id="banner-location"
                  placeholder="e.g. Regional - Maharashtra"
                  {...field}
                />
              )}
            />
            {errors.location ? (
              <p className="text-xs text-red-500">{errors.location.message}</p>
            ) : null}
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
                  setPreviewUrl(editBanner?.thumbnailUrl ?? null);
                  return;
                }
                setPreviewUrl(URL.createObjectURL(file));
                setImageUpload({ name: file.name, progress: 100 });
              }}
              onClear={() => {
                if (previewUrl?.startsWith("blob:")) {
                  URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl(editBanner?.thumbnailUrl ?? null);
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
