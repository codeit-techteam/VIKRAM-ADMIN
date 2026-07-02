"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Clapperboard,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  Upload,
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
import { PrioritySlider } from "@/features/cms/components/PrioritySlider";
import { ThumbnailPicker } from "@/features/cms/components/ThumbnailPicker";
import {
  MOCK_UPLOAD_FILE,
  PLACEMENT_OPTIONS,
  THUMBNAIL_FRAMES,
  VIDEO_AUDIENCE_OPTIONS,
  VIDEO_CATEGORY_OPTIONS,
} from "@/features/cms/constants/video-upload.mock";
import {
  videoUploadSchema,
  type VideoUploadSchema,
} from "@/features/cms/schema/video-upload.schema";
import { cn } from "@/lib/utils";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

export function VideoUploadForm() {
  const [uploadFile, setUploadFile] = useState<MockUploadFile | null>(
    MOCK_UPLOAD_FILE,
  );
  const [selectedThumbnailId, setSelectedThumbnailId] = useState(
    THUMBNAIL_FRAMES[0]?.id ?? "",
  );

  const { control, handleSubmit } = useForm<VideoUploadSchema>({
    resolver: zodResolver(videoUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "brand-story",
      targetAudience: "all-users",
      placements: ["home-screen-hero", "product-detail-pages"],
      priorityLevel: 8,
      publishImmediately: false,
      scheduledAt: "",
    },
  });

  const onSubmit = (data: VideoUploadSchema) => {
    console.log("Publish video:", { ...data, uploadFile, selectedThumbnailId });
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
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          Upload New Video Asset
        </h1>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" className="h-10 px-5">
            Discard
          </Button>
          <Button type="submit" className="h-10 px-5">
            Publish Video
          </Button>
        </div>
      </div>

      <FormSectionCard icon={Clapperboard} title="Video Asset Ingestion">
        <FileDropzone selectedFile={uploadFile} onFileSelect={setUploadFile} />
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
                  placeholder="e.g. Revolutionizing Warehouse Procurement"
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
                  placeholder="Describe the content for SEO and accessibility..."
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

      <FormSectionCard
        icon={ImageIcon}
        title="Thumbnail Selection"
        headerAction={
          <button
            type="button"
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-medium"
          >
            <Upload className="size-3.5" />
            Upload Custom
          </button>
        }
      >
        <ThumbnailPicker
          frames={THUMBNAIL_FRAMES}
          selectedId={selectedThumbnailId}
          onSelect={setSelectedThumbnailId}
        />
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
