"use client";

import { format } from "date-fns";
import {
  Edit,
  Eye,
  Image as ImageIcon,
  Plus,
  Search,
  Star,
  Trash2,
  Video,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { ConfirmationDialog } from "@/components/allocation/ConfirmationDialog";
import {
  FileDropzone,
  type MockUploadFile,
} from "@/components/shared/FileDropzone";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard } from "@/components/shared/StatCard";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import {
  TestimonialStatusBadge,
  TestimonialTypeBadge,
} from "@/features/testimonials/components/TestimonialStatusBadge";
import {
  createTestimonial,
  deleteTestimonial,
  EMPTY_TESTIMONIAL_FILTERS,
  getTestimonialStats,
  getTestimonials,
  TESTIMONIAL_PAGE_SIZE,
  updateTestimonial,
  type CreateTestimonialPayload,
  type TestimonialFilters,
} from "@/features/testimonials/services/testimonial.service";
import type {
  CustomerTestimonial,
  TestimonialDashboardStats,
  TestimonialStatus,
  TestimonialType,
} from "@/mock/mockTestimonials";
import { notify } from "@/utils/notify";

type StatFilter = "videos" | "images" | "published" | "draft";

const IMAGE_ACCEPT: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const VIDEO_ACCEPT: Record<string, string[]> = {
  "video/mp4": [".mp4"],
  "video/quicktime": [".mov"],
  "video/webm": [".webm"],
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

async function simulateUploadProgress(
  setUpload: Dispatch<SetStateAction<MockUploadFile | null>>,
  fileName: string,
) {
  setUpload({ name: fileName, progress: 0 });
  for (let progress = 20; progress <= 100; progress += 20) {
    await new Promise((resolve) => window.setTimeout(resolve, 80));
    setUpload({ name: fileName, progress });
  }
}

const EMPTY_FORM: CreateTestimonialPayload = {
  type: "IMAGE",
  customerName: "",
  location: "",
  city: "",
  rating: 5,
  review: "",
  mediaUrl: "",
  thumbnailUrl: "",
  status: "DRAFT",
};

export function TestimonialsPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TestimonialDashboardStats | null>(null);
  const [testimonials, setTestimonials] = useState<CustomerTestimonial[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "VIDEO" | "IMAGE">("all");
  const [filters, setFilters] = useState<TestimonialFilters>(
    EMPTY_TESTIMONIAL_FILTERS,
  );
  const [searchInput, setSearchInput] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerTestimonial | null>(
    null,
  );
  const [editingTestimonial, setEditingTestimonial] =
    useState<CustomerTestimonial | null>(null);
  const [previewTestimonial, setPreviewTestimonial] =
    useState<CustomerTestimonial | null>(null);
  const [form, setForm] = useState<CreateTestimonialPayload>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [activeStat, setActiveStat] = useState<StatFilter | null>(null);
  const [mediaUpload, setMediaUpload] = useState<MockUploadFile | null>(null);
  const [thumbnailUpload, setThumbnailUpload] = useState<MockUploadFile | null>(
    null,
  );
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(
    null,
  );

  const resetUploadState = () => {
    setMediaUpload(null);
    setThumbnailUpload(null);
    setMediaPreviewUrl(null);
    setThumbnailPreviewUrl(null);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const typeFilter =
        activeTab === "all"
          ? filters.type
          : (activeTab as TestimonialFilters["type"]);

      const [statsData, queryResult] = await Promise.all([
        getTestimonialStats(),
        getTestimonials({
          page: currentPage,
          limit: TESTIMONIAL_PAGE_SIZE,
          filters: { ...filters, type: typeFilter },
        }),
      ]);
      setStats(statsData);
      setTestimonials(queryResult.data);
      setTotal(queryResult.total);
      setTotalPages(queryResult.totalPages);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = (type: TestimonialType) => {
    setEditingTestimonial(null);
    setForm({ ...EMPTY_FORM, type });
    resetUploadState();
    setFormOpen(true);
  };

  const openEdit = (testimonial: CustomerTestimonial) => {
    setEditingTestimonial(testimonial);
    setForm({
      type: testimonial.type,
      customerName: testimonial.customerName,
      location: testimonial.location,
      city: testimonial.city,
      rating: testimonial.rating,
      review: testimonial.review,
      mediaUrl: testimonial.mediaUrl,
      thumbnailUrl: testimonial.thumbnailUrl ?? "",
      status: testimonial.status,
    });
    resetUploadState();
    if (testimonial.type === "IMAGE") {
      setMediaPreviewUrl(testimonial.mediaUrl);
      setMediaUpload({ name: "Current image", progress: 100 });
    } else {
      setMediaPreviewUrl(testimonial.thumbnailUrl ?? null);
      setThumbnailPreviewUrl(testimonial.thumbnailUrl ?? null);
      setMediaUpload({ name: "Current video", progress: 100 });
      if (testimonial.thumbnailUrl) {
        setThumbnailUpload({ name: "Current thumbnail", progress: 100 });
      }
    }
    setFormOpen(true);
  };

  const handleMediaFileSelect = async (file: File | null) => {
    if (!file) {
      setMediaUpload(null);
      setMediaPreviewUrl(null);
      setForm((prev) => ({ ...prev, mediaUrl: "" }));
      return;
    }

    try {
      await simulateUploadProgress(setMediaUpload, file.name);
      const dataUrl = await readFileAsDataUrl(file);
      setForm((prev) => ({ ...prev, mediaUrl: dataUrl }));
      setMediaPreviewUrl(file.type.startsWith("video/") ? null : dataUrl);
      if (file.type.startsWith("video/") && !thumbnailPreviewUrl) {
        setThumbnailPreviewUrl(null);
      }
    } catch {
      notify.error("Upload failed", "Unable to read the selected file.");
      setMediaUpload(null);
    }
  };

  const handleThumbnailFileSelect = async (file: File | null) => {
    if (!file) {
      setThumbnailUpload(null);
      setThumbnailPreviewUrl(null);
      setForm((prev) => ({ ...prev, thumbnailUrl: "" }));
      return;
    }

    try {
      await simulateUploadProgress(setThumbnailUpload, file.name);
      const dataUrl = await readFileAsDataUrl(file);
      setForm((prev) => ({ ...prev, thumbnailUrl: dataUrl }));
      setThumbnailPreviewUrl(dataUrl);
    } catch {
      notify.error("Upload failed", "Unable to read the thumbnail file.");
      setThumbnailUpload(null);
    }
  };

  const handleStatClick = (stat: StatFilter) => {
    if (activeStat === stat) {
      setActiveStat(null);
      setActiveTab("all");
      setFilters(EMPTY_TESTIMONIAL_FILTERS);
      setSearchInput("");
      setCurrentPage(1);
      return;
    }

    setActiveStat(stat);
    setCurrentPage(1);
    setSearchInput("");

    switch (stat) {
      case "videos":
        setActiveTab("VIDEO");
        setFilters({ ...EMPTY_TESTIMONIAL_FILTERS, type: "VIDEO" });
        break;
      case "images":
        setActiveTab("IMAGE");
        setFilters({ ...EMPTY_TESTIMONIAL_FILTERS, type: "IMAGE" });
        break;
      case "published":
        setActiveTab("all");
        setFilters({ ...EMPTY_TESTIMONIAL_FILTERS, status: "PUBLISHED" });
        break;
      case "draft":
        setActiveTab("all");
        setFilters({ ...EMPTY_TESTIMONIAL_FILTERS, status: "DRAFT" });
        break;
    }
  };

  const handleSave = async () => {
    if (!form.customerName || !form.review || !form.mediaUrl) {
      notify.error(
        "Validation error",
        `Please fill all required fields and upload a ${form.type === "VIDEO" ? "video" : "image"}.`,
      );
      return;
    }
    if (form.type === "VIDEO" && !form.thumbnailUrl) {
      notify.error("Validation error", "Please upload a video thumbnail.");
      return;
    }
    setFormLoading(true);
    try {
      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id, form);
        notify.success("Testimonial updated", "Changes saved successfully.");
      } else {
        await createTestimonial(form);
        notify.success("Testimonial created", "New testimonial added.");
      }
      setFormOpen(false);
      await loadData();
    } catch {
      notify.error("Save failed", "Unable to save testimonial.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTestimonial(deleteTarget.id);
      notify.success("Deleted", "Testimonial removed.");
      setDeleteTarget(null);
      await loadData();
    } catch {
      notify.error("Delete failed", "Unable to delete testimonial.");
    }
  };

  const togglePublish = async (testimonial: CustomerTestimonial) => {
    const newStatus: TestimonialStatus =
      testimonial.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await updateTestimonial(testimonial.id, { status: newStatus });
    notify.success(
      newStatus === "PUBLISHED" ? "Published" : "Unpublished",
      `Testimonial is now ${newStatus.toLowerCase()}.`,
    );
    await loadData();
  };

  const breadcrumbs = useMemo(
    () => getNavBreadcrumbsFromPath("/customer-app-cms/testimonials"),
    [],
  );

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`size-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
      />
    ));

  const renderTestimonialGrid = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      );
    }

    if (testimonials.length === 0) {
      return (
        <div className="p-8">
          <EmptyState
            title="No testimonials found"
            description="Create your first customer testimonial."
          />
          <div className="mt-4 flex justify-center">
            <Button
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => openCreate("IMAGE")}
            >
              <Plus className="size-4" />
              Create New
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-video bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={testimonial.thumbnailUrl ?? testimonial.mediaUrl}
                alt={testimonial.customerName}
                className="size-full object-cover"
              />
              <div className="absolute top-2 left-2 flex gap-1">
                <TestimonialTypeBadge type={testimonial.type} />
                <TestimonialStatusBadge status={testimonial.status} />
              </div>
              {testimonial.type === "VIDEO" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-black/50">
                    <Video className="size-5 text-white" />
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#1A1A1A]">
                    {testimonial.customerName}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {testimonial.location}, {testimonial.city}
                  </p>
                </div>
                <div className="flex">{renderStars(testimonial.rating)}</div>
              </div>
              <p className="line-clamp-2 text-sm text-[#64748B]">
                {testimonial.review}
              </p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={testimonial.status === "PUBLISHED"}
                    onCheckedChange={() => togglePublish(testimonial)}
                  />
                  <span className="text-xs text-[#64748B]">Publish</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setPreviewTestimonial(testimonial);
                      setPreviewOpen(true);
                    }}
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(testimonial)}
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => setDeleteTarget(testimonial)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Testimonials"
        subtitle="Manage video and image testimonials for the customer app."
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => openCreate("VIDEO")}
            >
              <Video className="size-4" />
              Add Video
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => openCreate("IMAGE")}
            >
              <Plus className="size-4" />
              Add Image
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Videos"
          value={stats?.totalVideos ?? 0}
          subtext="Video testimonials"
          icon={Video}
          iconContainerClassName="bg-purple-50"
          iconClassName="text-purple-600"
          isLoading={isLoading}
          isActive={activeStat === "videos"}
          onClick={() => handleStatClick("videos")}
        />
        <StatCard
          label="Images"
          value={stats?.totalImages ?? 0}
          subtext="Image testimonials"
          icon={ImageIcon}
          iconContainerClassName="bg-blue-50"
          iconClassName="text-blue-600"
          isLoading={isLoading}
          isActive={activeStat === "images"}
          onClick={() => handleStatClick("images")}
        />
        <StatCard
          label="Published"
          value={stats?.published ?? 0}
          subtext="Live on customer app"
          icon={Eye}
          iconContainerClassName="bg-green-50"
          iconClassName="text-green-600"
          isLoading={isLoading}
          isActive={activeStat === "published"}
          onClick={() => handleStatClick("published")}
        />
        <StatCard
          label="Draft"
          value={stats?.draft ?? 0}
          subtext="Awaiting review"
          icon={Edit}
          iconContainerClassName="bg-gray-50"
          iconClassName="text-gray-600"
          isLoading={isLoading}
          isActive={activeStat === "draft"}
          onClick={() => handleStatClick("draft")}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            const tab = v as typeof activeTab;
            setActiveTab(tab);
            setCurrentPage(1);
            if (tab === "VIDEO") {
              setActiveStat("videos");
              setFilters((prev) => ({ ...prev, type: "VIDEO" }));
            } else if (tab === "IMAGE") {
              setActiveStat("images");
              setFilters((prev) => ({ ...prev, type: "IMAGE" }));
            } else {
              setActiveStat((prev) =>
                prev === "videos" || prev === "images" ? null : prev,
              );
              setFilters((prev) => ({ ...prev, type: "all" }));
            }
          }}
        >
          <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="VIDEO" className="gap-1.5">
                <Video className="size-3.5" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="IMAGE" className="gap-1.5">
                <ImageIcon className="size-3.5" />
                Images
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search testimonials..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setFilters((prev) => ({ ...prev, search: searchInput }));
                      setCurrentPage(1);
                    }
                  }}
                  className="w-full pl-9 sm:w-56"
                />
              </div>
              <Select
                value={filters.status}
                onValueChange={(v) => {
                  const status = v as TestimonialFilters["status"];
                  setFilters((prev) => ({ ...prev, status }));
                  setCurrentPage(1);
                  if (status === "PUBLISHED") {
                    setActiveStat("published");
                  } else if (status === "DRAFT") {
                    setActiveStat("draft");
                  } else if (
                    activeStat === "published" ||
                    activeStat === "draft"
                  ) {
                    setActiveStat(null);
                  }
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            {renderTestimonialGrid()}
          </TabsContent>
          <TabsContent value="VIDEO" className="mt-0">
            {renderTestimonialGrid()}
          </TabsContent>
          <TabsContent value="IMAGE" className="mt-0">
            {renderTestimonialGrid()}
          </TabsContent>
        </Tabs>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={TESTIMONIAL_PAGE_SIZE}
          totalItems={total}
          onPageChange={setCurrentPage}
          itemLabel="testimonials"
        />
      </div>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) resetUploadState();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? "Edit Testimonial" : "Create Testimonial"}
            </DialogTitle>
            <DialogDescription>
              {form.type === "VIDEO" ? "Video" : "Image"} testimonial for the
              customer app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="t-name">Customer Name *</Label>
                <Input
                  id="t-name"
                  value={form.customerName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      customerName: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="t-city">City *</Label>
                <Input
                  id="t-city"
                  value={form.city}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="t-location">Location</Label>
              <Input
                id="t-location"
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>{form.type === "VIDEO" ? "Video *" : "Image *"}</Label>
              <div className="mt-1">
                <FileDropzone
                  variant={form.type === "VIDEO" ? "banner" : "compact"}
                  label={
                    form.type === "VIDEO"
                      ? "Upload video from this device"
                      : "Upload image from this device"
                  }
                  helperText={
                    form.type === "VIDEO"
                      ? "MP4, MOV, WebM (Max 100MB)"
                      : "JPG, PNG, WebP (Max 5MB)"
                  }
                  accept={form.type === "VIDEO" ? VIDEO_ACCEPT : IMAGE_ACCEPT}
                  maxSize={
                    form.type === "VIDEO" ? 100 * 1024 * 1024 : 5 * 1024 * 1024
                  }
                  selectedFile={mediaUpload}
                  previewUrl={mediaPreviewUrl}
                  onFileSelect={setMediaUpload}
                  onFileChange={handleMediaFileSelect}
                  onClear={() => {
                    setMediaUpload(null);
                    setMediaPreviewUrl(null);
                    setForm((prev) => ({ ...prev, mediaUrl: "" }));
                  }}
                />
              </div>
            </div>
            {form.type === "VIDEO" && (
              <div>
                <Label>Thumbnail *</Label>
                <div className="mt-1">
                  <FileDropzone
                    variant="compact"
                    label="Upload thumbnail from this device"
                    helperText="JPG, PNG, WebP (Max 2MB)"
                    accept={IMAGE_ACCEPT}
                    maxSize={2 * 1024 * 1024}
                    selectedFile={thumbnailUpload}
                    previewUrl={thumbnailPreviewUrl}
                    onFileSelect={setThumbnailUpload}
                    onFileChange={handleThumbnailFileSelect}
                    onClear={() => {
                      setThumbnailUpload(null);
                      setThumbnailPreviewUrl(null);
                      setForm((prev) => ({ ...prev, thumbnailUrl: "" }));
                    }}
                  />
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="t-rating">Rating (1–5)</Label>
              <Select
                value={String(form.rating)}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, rating: Number(v) }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {r} Star{r !== 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="t-review">Review *</Label>
              <Textarea
                id="t-review"
                value={form.review}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, review: e.target.value }))
                }
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.status === "PUBLISHED"}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({
                    ...prev,
                    status: checked ? "PUBLISHED" : "DRAFT",
                  }))
                }
              />
              <Label>Publish immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              disabled={formLoading}
              onClick={handleSave}
            >
              {formLoading
                ? "Saving..."
                : editingTestimonial
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{previewTestimonial?.customerName}</DialogTitle>
            <DialogDescription>
              {previewTestimonial?.location}, {previewTestimonial?.city}
            </DialogDescription>
          </DialogHeader>
          {previewTestimonial && (
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    previewTestimonial.thumbnailUrl ??
                    previewTestimonial.mediaUrl
                  }
                  alt={previewTestimonial.customerName}
                  className="size-full object-cover"
                />
              </div>
              <div className="flex">
                {renderStars(previewTestimonial.rating)}
              </div>
              <p className="text-sm text-[#64748B]">
                {previewTestimonial.review}
              </p>
              <p className="text-xs text-gray-400">
                Created{" "}
                {format(new Date(previewTestimonial.createdAt), "dd MMM yyyy")}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Testimonial"
        message={`Are you sure you want to delete the testimonial from ${deleteTarget?.customerName}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
