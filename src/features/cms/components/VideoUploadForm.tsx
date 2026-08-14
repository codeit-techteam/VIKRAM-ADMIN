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
import { Controller, useForm } from "react-hook-form";

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
  videoUploadSchema,
  type VideoUploadSchema,
} from "@/features/cms/schema/video-upload.schema";
import { videosService } from "@/services/videos.service";
import { useInvalidateCmsVideos } from "@/hooks/useCmsVideos";
import { notify } from "@/utils/notify";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

function mapPlacementsToApi(placements: string[]): string {
  if (placements.includes("home-screen-hero")) return "HOME_HERO_VIDEO";
  if (placements.includes("product-detail-pages")) return "PRODUCT";
  if (placements.includes("category-landing-pages")) return "CATEGORY";
  if (placements.includes("featured-videos")) return "HOME";
  return "HOME_HERO_VIDEO";
}

export function VideoUploadForm() {
  const router = useRouter();
  const invalidateVideos = useInvalidateCmsVideos();
  const [uploadFile, setUploadFile] = useState<MockUploadFile | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { control, handleSubmit, watch, setValue } = useForm<VideoUploadSchema>({
    resolver: zodResolver(videoUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "brand-story",
      targetAudience: "all-users",
      placements: ["home-screen-hero"],
      priorityLevel: 8,
      publishImmediately: true,
      scheduledAt: "",
      ctaEnabled: true,
      ctaLabel: "View Product",
      ctaDestination: "PRODUCT",
      linkType: "PRODUCT",
      ctaPath: "",
      ctaTargetLabel: "",
    },
  });

  const ctaEnabled = watch("ctaEnabled");
  const ctaDestination = watch("ctaDestination");
  const ctaPath = watch("ctaPath") ?? "";
  const linkType = watch("linkType") ?? "PRODUCT";
  const ctaTargetLabel = watch("ctaTargetLabel") ?? "";

  useEffect(() => {
    if (!rawFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(rawFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [rawFile]);

  const onSubmit = async (data: VideoUploadSchema) => {
    if (!rawFile) {
      notify.error("Select an MP4 / MOV / WEBM file to upload");
      return;
    }
    setSaving(true);
    setUploadProgress(0);
    try {
      await videosService.upload(
        {
          file: rawFile,
          title: data.title,
          description: data.description,
          placement: mapPlacementsToApi(data.placements),
          linkUrl: data.ctaEnabled ? data.ctaPath : undefined,
          linkType: data.ctaEnabled ? data.linkType : undefined,
          linkTarget: data.ctaEnabled ? data.ctaPath : undefined,
          ctaLabel: data.ctaEnabled ? data.ctaLabel : undefined,
          priority: data.priorityLevel,
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
        error instanceof Error ? error.message : "Failed to upload video",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Customer App CMS", href: "/customer-app-cms" },
          { label: "Video Management", href: "/customer-app-cms/videos" },
          { label: "Upload New Video" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Upload New Video
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            The file plays directly in the Customer App. Pick a product for the
            button so shoppers land on the right page.
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
          <Button type="submit" className="h-10 px-5" disabled={saving}>
            {saving
              ? uploadProgress > 0 && uploadProgress < 100
                ? `Uploading ${uploadProgress}%…`
                : "Publishing…"
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
          accept={{
            "video/mp4": [".mp4"],
            "video/quicktime": [".mov"],
            "video/webm": [".webm"],
          }}
          helperText="MP4, MOV, or WEBM up to 500MB. Stored on Cloudflare R2 and streamed in the app."
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
                    Opens a product, category, or other screen when tapped.
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
                      placeholder="e.g. View Product, Shop Now"
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
                    <BannerCtaDestinationPicker
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
