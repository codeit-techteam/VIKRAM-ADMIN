"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Clapperboard,
  FileText,
  LayoutGrid,
  MousePointerClick,
} from "lucide-react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { CheckboxGroup } from "@/components/shared/CheckboxGroup";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BannerCtaDestinationPicker } from "@/features/cms/components/BannerCtaDestinationPicker";
import { PrioritySlider } from "@/features/cms/components/PrioritySlider";
import {
  PLACEMENT_OPTIONS,
  VIDEO_AUDIENCE_OPTIONS,
  VIDEO_CATEGORY_OPTIONS,
} from "@/features/cms/constants/video-upload.mock";
import {
  clampVideoPriority,
  videoUploadSchema,
  type VideoUploadSchema,
} from "@/features/cms/schema/video-upload.schema";
import { videosService } from "@/services/videos.service";
import { useInvalidateCmsVideos } from "@/hooks/useCmsVideos";
import { notify } from "@/utils/notify";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { inferBannerCtaDestination } from "@/features/cms/schema/banner-form.schema";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

function mapPlacementsToApi(placements: string[]): string {
  if (placements.includes("home-screen-hero")) return "HOME_HERO_VIDEO";
  if (placements.includes("product-detail-pages")) return "PRODUCT";
  if (placements.includes("category-landing-pages")) return "CATEGORY";
  if (placements.includes("featured-videos")) return "HOME";
  return "HOME_HERO_VIDEO";
}

function mapApiPlacementToForm(placement?: string | null): string[] {
  switch ((placement || "").toUpperCase()) {
    case "PRODUCT":
      return ["product-detail-pages"];
    case "CATEGORY":
      return ["category-landing-pages"];
    case "HOME":
    case "HOME_SECONDARY":
      return ["featured-videos"];
    default:
      return ["home-screen-hero"];
  }
}

function toDatetimeLocal(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function firstFormError(errors: FieldErrors<VideoUploadSchema>): string {
  const walk = (value: unknown): string | null => {
    if (!value || typeof value !== "object") return null;
    if (
      "message" in value &&
      typeof (value as { message?: unknown }).message === "string"
    ) {
      return (value as { message: string }).message;
    }
    for (const child of Object.values(value as Record<string, unknown>)) {
      const found = walk(child);
      if (found) return found;
    }
    return null;
  };
  return walk(errors) ?? "Fix the highlighted fields before saving";
}

function buildCtaFields(data: VideoUploadSchema) {
  if (!data.ctaEnabled) {
    return {
      linkUrl: "",
      linkType: "",
      linkTarget: "",
      ctaLabel: "",
    };
  }
  const path = (data.ctaPath || "").trim();
  return {
    linkUrl: path,
    linkType: data.linkType || data.ctaDestination || "PRODUCT",
    linkTarget: path,
    ctaLabel: data.ctaLabel?.trim() || "Shop Now",
  };
}

const DEFAULT_FORM: VideoUploadSchema = {
  title: "",
  description: "",
  category: "brand-story",
  targetAudience: "all-users",
  placements: ["home-screen-hero"],
  priorityLevel: 8,
  publishImmediately: true,
  scheduledAt: "",
  ctaEnabled: true,
  ctaLabel: "Shop Now",
  ctaDestination: "PRODUCT",
  linkType: "PRODUCT",
  ctaPath: "",
  ctaTargetLabel: "",
};

export function VideoUploadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = Boolean(editId);
  const invalidateVideos = useInvalidateCmsVideos();
  const [uploadFile, setUploadFile] = useState<MockUploadFile | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { control, handleSubmit, watch, setValue, reset } =
    useForm<VideoUploadSchema>({
      resolver: zodResolver(videoUploadSchema),
      defaultValues: DEFAULT_FORM,
    });

  const ctaEnabled = watch("ctaEnabled");
  const ctaDestination = watch("ctaDestination");
  const ctaPath = watch("ctaPath") ?? "";
  const linkType = watch("linkType") ?? "PRODUCT";
  const ctaTargetLabel = watch("ctaTargetLabel") ?? "";

  useEffect(() => {
    if (!editId) {
      setLoadingVideo(false);
      return;
    }

    let cancelled = false;
    setLoadingVideo(true);

    void videosService
      .getById(editId)
      .then((video) => {
        if (cancelled) return;
        const cta = inferBannerCtaDestination(
          video.linkType,
          video.linkTarget || video.linkUrl,
        );
        reset({
          title: video.title ?? "",
          description: video.description ?? "",
          category: "brand-story",
          targetAudience: "all-users",
          placements: mapApiPlacementToForm(video.placement),
          priorityLevel: clampVideoPriority(video.priority),
          publishImmediately: Boolean(video.published ?? video.isVisible),
          scheduledAt: toDatetimeLocal(video.scheduledAt),
          ctaEnabled: Boolean(
            video.ctaLabel || video.linkTarget || video.linkUrl,
          ),
          ctaLabel: video.ctaLabel || "Shop Now",
          ctaDestination: cta.ctaDestination,
          linkType: cta.linkType,
          ctaPath: cta.ctaPath,
          ctaTargetLabel: cta.ctaTargetLabel ?? "",
        });
        const url = (video.publicUrl || video.videoUrl || "").trim();
        if (url) {
          setExistingVideoUrl(url);
          setPreviewUrl(url);
          setUploadFile({ name: "current-video.mp4", progress: 100 });
        }
      })
      .catch((error) => {
        if (cancelled) return;
        notify.error(
          error instanceof Error ? error.message : "Failed to load video",
        );
        router.push("/customer-app-cms/videos");
      })
      .finally(() => {
        if (!cancelled) setLoadingVideo(false);
      });

    return () => {
      cancelled = true;
    };
  }, [editId, reset, router]);

  useEffect(() => {
    if (!rawFile) {
      setPreviewUrl(existingVideoUrl);
      if (existingVideoUrl) {
        setUploadFile({ name: "current-video.mp4", progress: 100 });
      }
      return;
    }
    const objectUrl = URL.createObjectURL(rawFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [rawFile, existingVideoUrl]);

  const restoreExistingPreview = () => {
    setRawFile(null);
    if (existingVideoUrl) {
      setPreviewUrl(existingVideoUrl);
      setUploadFile({ name: "current-video.mp4", progress: 100 });
    } else {
      setPreviewUrl(null);
      setUploadFile(null);
    }
  };

  const onInvalid = (errors: FieldErrors<VideoUploadSchema>) => {
    notify.error(firstFormError(errors));
  };

  const onSubmit = async (data: VideoUploadSchema) => {
    if (!isEdit && !rawFile) {
      notify.error("Select an MP4 / MOV / WEBM file to upload");
      return;
    }

    setSaving(true);
    setUploadProgress(0);
    const cta = buildCtaFields(data);

    try {
      if (isEdit && editId) {
        if (rawFile) {
          await videosService.replaceFile(editId, rawFile, (percent) => {
            setUploadProgress(percent);
            setUploadFile((prev) =>
              prev ? { ...prev, progress: percent } : prev,
            );
          });
        }
        await videosService.update(editId, {
          title: data.title,
          description: data.description ?? "",
          placement: mapPlacementsToApi(data.placements),
          ...cta,
          priority: clampVideoPriority(data.priorityLevel),
          published: data.publishImmediately,
        });
        await invalidateVideos();
        notify.success("Changes saved — the Customer App will refresh this video");
        router.push("/customer-app-cms/videos");
        return;
      }

      if (!rawFile) {
        notify.error("Select an MP4 / MOV / WEBM file to upload");
        return;
      }

      await videosService.upload(
        {
          file: rawFile,
          title: data.title,
          description: data.description,
          placement: mapPlacementsToApi(data.placements),
          ...cta,
          priority: clampVideoPriority(data.priorityLevel),
          publish: data.publishImmediately,
        },
        (percent) => {
          setUploadProgress(percent);
          setUploadFile((prev) =>
            prev ? { ...prev, progress: percent } : prev,
          );
        },
      );

      await invalidateVideos();
      notify.success("Video published — the Customer App will refresh it now");
      router.push("/customer-app-cms/videos");
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to save video",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingVideo) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-[#64748B]">Loading video…</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-6"
    >
      <Breadcrumbs
        items={[
          { label: "Customer App CMS", href: "/customer-app-cms" },
          { label: "Video Management", href: "/customer-app-cms/videos" },
          { label: isEdit ? "Edit Video" : "Upload New Video" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            {isEdit ? "Edit Video" : "Upload New Video"}
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Set Shop Now to open a product in the Customer App. Search and pick
            the catalog item shoppers should land on.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-5"
            onClick={() => router.push("/customer-app-cms/videos")}
          >
            Discard
          </Button>
          <Button
            type="button"
            nativeButton
            className="h-10 px-5"
            disabled={saving}
            onClick={() => void handleSubmit(onSubmit, onInvalid)()}
          >
            {saving
              ? uploadProgress > 0 && uploadProgress < 100
                ? `Uploading ${uploadProgress}%…`
                : "Saving…"
              : isEdit
                ? "Save changes"
                : "Publish Video"}
          </Button>
        </div>
      </div>

      <FormSectionCard icon={Clapperboard} title="Video file">
        <FileDropzone
          selectedFile={uploadFile}
          previewUrl={previewUrl}
          onFileSelect={setUploadFile}
          onFileChange={(file) => {
            setRawFile(file);
            if (file) {
              setUploadFile({ name: file.name, progress: 0 });
            }
          }}
          onClear={restoreExistingPreview}
          accept={{
            "video/mp4": [".mp4"],
            "video/quicktime": [".mov"],
            "video/webm": [".webm"],
          }}
          helperText={
            isEdit
              ? "Optional. Leave the current file to only change Shop Now or other details."
              : "MP4, MOV, or WEBM up to 500MB. Stored on Cloudflare R2 and streamed in the app."
          }
        />
      </FormSectionCard>

      <FormSectionCard icon={FileText} title="Content Details">
        <div className="space-y-5">
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="title" className={fieldLabelClassName}>
                  Video Title
                </Label>
                <Input
                  {...field}
                  id="title"
                  placeholder="e.g. Materials Delivered Right to Your Site"
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

          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor="description" className={fieldLabelClassName}>
                  Description
                </Label>
                <Textarea
                  {...field}
                  id="description"
                  rows={4}
                  placeholder="Shown under the title in the Customer App"
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
              name="category"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label className={fieldLabelClassName}>
                    Category Selection
                  </Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={!!fieldState.error}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
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
              name="targetAudience"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label className={fieldLabelClassName}>Target Audience</Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={!!fieldState.error}>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_AUDIENCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
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
          </div>
        </div>
      </FormSectionCard>

      <FormSectionCard icon={MousePointerClick} title="Customer App button">
        <div className="space-y-5">
          <Controller
            control={control}
            name="ctaEnabled"
            render={({ field }) => (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                <div>
                  <Label
                    htmlFor="cta-enabled"
                    className="text-sm font-medium text-[#1A1A1A]"
                  >
                    Show button on Customer App
                  </Label>
                  <p className="mt-0.5 text-sm text-[#64748B]">
                    Shop Now opens a product page when you pick Product below.
                  </p>
                </div>
                <Switch
                  id="cta-enabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />

          {ctaEnabled && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Controller
                control={control}
                name="ctaLabel"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label htmlFor="cta-label" className={fieldLabelClassName}>
                      Button Label
                    </Label>
                    <Input
                      {...field}
                      id="cta-label"
                      placeholder="Shop Now"
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

              <div className="lg:col-span-2">
                <Controller
                  control={control}
                  name="ctaPath"
                  render={({ fieldState }) => (
                    <div>
                      <BannerCtaDestinationPicker
                      preferProduct
                      value={{
                        ctaDestination,
                        linkType,
                        ctaPath,
                        ctaTargetLabel,
                      }}
                      onChange={(next) => {
                        setValue("ctaDestination", next.ctaDestination, {
                          shouldValidate: true,
                        });
                        setValue("linkType", next.linkType, {
                          shouldValidate: true,
                        });
                        setValue("ctaPath", next.ctaPath, {
                          shouldValidate: true,
                        });
                        setValue("ctaTargetLabel", next.ctaTargetLabel ?? "", {
                          shouldDirty: true,
                        });
                      }}
                      error={fieldState.error?.message}
                    />
                    {ctaDestination !== "PRODUCT" ? (
                      <p className="mt-2 text-sm text-amber-800">
                        Shop Now currently opens{" "}
                        {ctaDestination === "CATALOG"
                          ? "Catalog"
                          : ctaDestination.toLowerCase()}
                        . Choose <span className="font-semibold">Product</span>{" "}
                        and pick an item so the Customer App opens that product
                        page.
                      </p>
                    ) : null}
                    </div>
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </FormSectionCard>

      <FormSectionCard icon={LayoutGrid} title="Placement & Priority">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Controller
            control={control}
            name="placements"
            render={({ field, fieldState }) => (
              <div className="space-y-3">
                <Label className={fieldLabelClassName}>App Placement</Label>
                <CheckboxGroup
                  options={[...PLACEMENT_OPTIONS]}
                  selectedIds={field.value}
                  onChange={field.onChange}
                />
                {fieldState.error && (
                  <p className="text-destructive text-sm">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          <div className="space-y-5">
            <Controller
              control={control}
              name="priorityLevel"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className={fieldLabelClassName}>
                    Display Priority
                  </Label>
                  <PrioritySlider
                    value={field.value}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="publishImmediately"
              render={({ field }) => (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <Label
                      htmlFor="publish-immediately"
                      className="text-sm font-medium text-[#1A1A1A]"
                    >
                      Publish Immediately
                    </Label>
                    <Switch
                      id="publish-immediately"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>

                  <Controller
                    control={control}
                    name="scheduledAt"
                    render={({ field: scheduledField }) => (
                      <div className="relative">
                        <Calendar className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          {...scheduledField}
                          type="datetime-local"
                          disabled={field.value}
                          placeholder="mm/dd/yyyy, --:-- --"
                          className={cn(
                            "pl-10",
                            field.value && "cursor-not-allowed opacity-50",
                          )}
                        />
                      </div>
                    )}
                  />
                </div>
              )}
            />
          </div>
        </div>
      </FormSectionCard>
    </form>
  );
}
