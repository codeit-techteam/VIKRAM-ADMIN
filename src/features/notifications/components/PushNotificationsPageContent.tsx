"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BellRing,
  CalendarClock,
  Clock,
  History,
  Plus,
  Send,
  Users,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";

import {
  CharCounterInput,
  CharCounterTextarea,
} from "@/components/shared/CharCounterInput";
import {
  FileDropzone,
  type MockUploadFile,
} from "@/components/shared/FileDropzone";
import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { PillRadioGroup } from "@/components/shared/PillRadioGroup";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AudienceSelector } from "@/features/notifications/components/AudienceSelector";
import { NotificationHistoryTable } from "@/features/notifications/components/NotificationHistoryTable";
import { DEEP_LINK_OPTIONS } from "@/features/notifications/constants/notification.mock";
import {
  pushNotificationSchema,
  type PushNotificationSchema,
} from "@/features/notifications/schema/push-notification.schema";
import type {
  AudienceType,
  DeepLinkTarget,
  DeliveryMode,
  PushComposerOptions,
  PushNotification,
  PushNotificationStats,
} from "@/features/notifications/types/notification.types";
import { notificationsService } from "@/services/cms-notifications.service";
import { uploadMediaFile } from "@/services/media.service";
import { notify } from "@/utils/notify";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

const DELIVERY_OPTIONS: { value: DeliveryMode; label: string }[] = [
  { value: "now", label: "Send Now" },
  { value: "scheduled", label: "Schedule for Later" },
];

const LIVE_STATUSES = new Set(["QUEUED", "SENDING"]);

function formatSubscriberCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return payload?.message || payload?.error || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export function PushNotificationsPageContent() {
  const composerRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [uploadFile, setUploadFile] = useState<MockUploadFile | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imagePreviewUrlRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [sendingDraftId, setSendingDraftId] = useState<string | null>(null);
  const [history, setHistory] = useState<PushNotification[]>([]);
  const [composerOptions, setComposerOptions] =
    useState<PushComposerOptions | null>(null);
  const [stats, setStats] = useState<PushNotificationStats>({
    totalSentThisMonth: 0,
    avgOpenRatePercent: 0,
    activeSubscribers: 0,
    scheduledCount: 0,
  });

  const { control, handleSubmit, watch, setValue, reset, getValues } =
    useForm<PushNotificationSchema>({
      resolver: zodResolver(pushNotificationSchema),
      defaultValues: {
        title: "",
        message: "",
        imageUrl: undefined,
        audienceType: "all",
        audienceTargets: [],
        deepLinkTarget: "home",
        deepLinkValue: "",
        deliveryMode: "now",
        scheduledAt: "",
      },
    });

  const deepLinkTarget = watch("deepLinkTarget");
  const deliveryMode = watch("deliveryMode");

  const loadData = useCallback(async () => {
    try {
      const [historyData, statsData, options] = await Promise.all([
        notificationsService.getHistory(),
        notificationsService.getStats(),
        notificationsService.getOptions().catch(() => null),
      ]);
      setHistory(historyData);
      setStats(statsData);
      if (options) setComposerOptions(options);
    } catch (error) {
      notify.error(
        "Failed to load notifications",
        apiErrorMessage(error, "Please try again."),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const hasLive = history.some((row) => LIVE_STATUSES.has(row.status));
    if (!hasLive) return;
    const timer = window.setInterval(() => {
      void loadData();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [history, loadData]);

  const scrollToComposer = () => {
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleHistory = () => {
    setShowHistory((current) => {
      const next = !current;
      if (next) {
        requestAnimationFrame(() => {
          historyRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }
      return next;
    });
  };

  const handleImageChange = (file: File | null) => {
    if (imagePreviewUrlRef.current) {
      URL.revokeObjectURL(imagePreviewUrlRef.current);
      imagePreviewUrlRef.current = null;
    }

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      imagePreviewUrlRef.current = previewUrl;
      setImagePreviewUrl(previewUrl);
      setImageFile(file);
      setUploadFile({ name: file.name, progress: 0 });
      setValue("imageUrl", file.name);
      return;
    }

    setImageFile(null);
    setUploadFile(null);
    setImagePreviewUrl(null);
    setValue("imageUrl", undefined);
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrlRef.current) {
        URL.revokeObjectURL(imagePreviewUrlRef.current);
      }
    };
  }, []);

  const uploadImageIfNeeded = async (): Promise<string | undefined> => {
    if (!imageFile) return undefined;
    const uploaded = await uploadMediaFile(imageFile, "thumbnails", {
      onProgress: (percent) => {
        setUploadFile({ name: imageFile.name, progress: percent });
      },
    });
    return uploaded.publicUrl;
  };

  const resetComposer = () => {
    reset({
      title: "",
      message: "",
      imageUrl: undefined,
      audienceType: "all",
      audienceTargets: [],
      deepLinkTarget: "home",
      deepLinkValue: "",
      deliveryMode: "now",
      scheduledAt: "",
    });
    handleImageChange(null);
  };

  const onSubmit = async (data: PushNotificationSchema) => {
    setIsSubmitting(true);
    try {
      const imageUrl = await uploadImageIfNeeded();
      const result = await notificationsService.send({
        title: data.title,
        message: data.message,
        audienceType: data.audienceType,
        audienceTargets: data.audienceTargets,
        deepLinkTarget: data.deepLinkTarget,
        deepLinkValue: data.deepLinkValue,
        imageUrl,
        deliveryMode: data.deliveryMode,
        scheduledAt: data.scheduledAt,
      });

      if (result.status === "QUEUED") {
        notify.success(
          "Notification queued successfully",
          "Delivery is running in the background. History will update live.",
        );
      } else if (result.status === "SCHEDULED") {
        notify.success("Notification scheduled", result.scheduledAt ?? "");
      } else {
        notify.success(
          "Notification sent",
          `Sent ${result.totalSent.toLocaleString("en-IN")} · Failed ${result.totalFailed.toLocaleString("en-IN")}`,
        );
      }

      resetComposer();
      await loadData();
    } catch (error) {
      notify.error("Send failed", apiErrorMessage(error, "Unable to send notification."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSaveDraft = async () => {
    const data = getValues();
    if (!data.title.trim() || !data.message.trim()) {
      notify.error("Draft incomplete", "Title and message are required.");
      return;
    }
    setIsSavingDraft(true);
    try {
      const imageUrl = await uploadImageIfNeeded();
      await notificationsService.send({
        ...data,
        imageUrl,
        saveAsDraft: true,
      });
      notify.success("Draft saved", "This notification was not sent.");
      resetComposer();
      await loadData();
    } catch (error) {
      notify.error("Draft failed", apiErrorMessage(error, "Unable to save draft."));
    } finally {
      setIsSavingDraft(false);
    }
  };

  const onSendDraft = async (id: string) => {
    setSendingDraftId(id);
    try {
      await notificationsService.sendDraft(id);
      notify.success(
        "Notification queued successfully",
        "Delivery is running in the background. History will update live.",
      );
      await loadData();
    } catch (error) {
      notify.error(
        "Send failed",
        apiErrorMessage(error, "Unable to send this draft."),
      );
    } finally {
      setSendingDraftId(null);
    }
  };

  const onSendTest = async () => {
    const data = getValues();
    if (!data.title.trim() || !data.message.trim()) {
      notify.error("Test incomplete", "Title and message are required.");
      return;
    }
    setIsTesting(true);
    try {
      const imageUrl = await uploadImageIfNeeded();
      const result = await notificationsService.sendTest({
        title: data.title,
        message: data.message,
        imageUrl,
        deepLinkTarget: data.deepLinkTarget,
        deepLinkValue: data.deepLinkValue,
      });
      if (result.sent <= 0) {
        notify.error(
          "Test not delivered",
          result.fcmConfigured
            ? "FCM rejected the test device token."
            : "Firebase is not configured on the server.",
        );
        return;
      }
      notify.success(
        "Test sent",
        `Delivered to ${result.sent} registered device${result.sent === 1 ? "" : "s"}.`,
      );
    } catch (error) {
      notify.error(
        "Test failed",
        apiErrorMessage(error, "No registered device found for test notification."),
      );
    } finally {
      setIsTesting(false);
    }
  };

  const deepLinkSecondaryOptions = useMemo(() => {
    if (deepLinkTarget === "product") return composerOptions?.products ?? [];
    if (deepLinkTarget === "offer") return composerOptions?.offers ?? [];
    if (deepLinkTarget === "category") return composerOptions?.categories ?? [];
    return [];
  }, [composerOptions, deepLinkTarget]);

  const busy = isSubmitting || isSavingDraft || isTesting;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Push Notifications"
        subtitle="Send targeted announcements directly to the Bajriwala customer app."
        breadcrumbs={getNavBreadcrumbsFromPath(
          "/customer-app-cms/push-notifications",
        )}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-10 gap-2 px-4"
              onClick={toggleHistory}
            >
              <History className="size-4" />
              History
            </Button>
            <Button
              type="button"
              size="lg"
              className="h-10 gap-2 px-4"
              onClick={scrollToComposer}
            >
              <Plus className="size-4" />
              New Notification
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Sent"
          value={stats.totalSentThisMonth}
          subtext="This month"
          icon={Send}
          iconContainerClassName="bg-orange-50"
          iconClassName="text-primary"
          isLoading={isLoading}
        />
        <StatCard
          label="Avg. Open Rate"
          value={
            stats.avgOpenRatePercent > 0
              ? `${stats.avgOpenRatePercent}%`
              : "0%"
          }
          icon={BellRing}
          iconContainerClassName="bg-emerald-50"
          iconClassName="text-emerald-600"
          isLoading={isLoading}
        />
        <StatCard
          label="Active Subscribers"
          value={formatSubscriberCount(stats.activeSubscribers)}
          icon={Users}
          iconContainerClassName="bg-blue-50"
          iconClassName="text-blue-600"
          isLoading={isLoading}
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduledCount}
          subtext="Upcoming"
          icon={CalendarClock}
          iconContainerClassName="bg-violet-50"
          iconClassName="text-violet-600"
          isLoading={isLoading}
        />
      </div>

      <div ref={composerRef}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSectionCard icon={BellRing} title="Compose Notification">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="notification-title"
                  className={fieldLabelClassName}
                >
                  Notification Title
                </Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <CharCounterInput
                      id="notification-title"
                      value={field.value}
                      maxLength={50}
                      placeholder="🔥 Monsoon Sale is Live!"
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="notification-message"
                  className={fieldLabelClassName}
                >
                  Message Body
                </Label>
                <Controller
                  name="message"
                  control={control}
                  render={({ field }) => (
                    <CharCounterTextarea
                      id="notification-message"
                      value={field.value}
                      maxLength={150}
                      placeholder="Write a short, action-oriented message for your users."
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className={fieldLabelClassName}>
                  Notification Image{" "}
                  <span className="font-normal tracking-normal text-gray-400 normal-case">
                    (Optional — uploaded to R2)
                  </span>
                </Label>
                <FileDropzone
                  variant="compact"
                  label="Drop image or click to upload"
                  helperText="1000×500px recommended · JPG, PNG · Max 2MB"
                  accept={{
                    "image/jpeg": [".jpg", ".jpeg"],
                    "image/png": [".png"],
                    "image/webp": [".webp"],
                  }}
                  maxSize={2 * 1024 * 1024}
                  selectedFile={uploadFile}
                  previewUrl={imagePreviewUrl}
                  onFileSelect={setUploadFile}
                  onFileChange={handleImageChange}
                />
              </div>

              <Controller
                name="audienceType"
                control={control}
                render={({ field: audienceField }) => (
                  <Controller
                    name="audienceTargets"
                    control={control}
                    render={({ field: targetsField }) => (
                      <AudienceSelector
                        audienceType={audienceField.value as AudienceType}
                        audienceTargets={targetsField.value ?? []}
                        options={composerOptions}
                        onAudienceTypeChange={(value) => {
                          audienceField.onChange(value);
                          targetsField.onChange([]);
                        }}
                        onAudienceTargetsChange={targetsField.onChange}
                      />
                    )}
                  />
                )}
              />

              <div className="space-y-3">
                <Label className={fieldLabelClassName}>
                  Deep Link / Action on Tap
                </Label>
                <Controller
                  name="deepLinkTarget"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value as DeepLinkTarget);
                        setValue("deepLinkValue", "");
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEEP_LINK_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                {deepLinkTarget === "custom_url" || deepLinkTarget === "order" ? (
                  <Controller
                    name="deepLinkValue"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={
                          deepLinkTarget === "order"
                            ? "Order ID"
                            : "https://bajriwala.in/offers/monsoon-sale"
                        }
                      />
                    )}
                  />
                ) : null}

                {deepLinkSecondaryOptions.length > 0 ? (
                  <Controller
                    name="deepLinkValue"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                        <SelectContent>
                          {deepLinkSecondaryOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : null}
              </div>

              <div className="space-y-3">
                <Label className={fieldLabelClassName}>Delivery</Label>
                <Controller
                  name="deliveryMode"
                  control={control}
                  render={({ field }) => (
                    <PillRadioGroup
                      name="delivery-mode"
                      options={DELIVERY_OPTIONS}
                      value={field.value as DeliveryMode}
                      onChange={field.onChange}
                    />
                  )}
                />

                {deliveryMode === "scheduled" ? (
                  <Controller
                    name="scheduledAt"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label
                          htmlFor="scheduled-at"
                          className={fieldLabelClassName}
                        >
                          Schedule Date & Time
                        </Label>
                        <div className="relative">
                          <Clock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="scheduled-at"
                            type="datetime-local"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </div>
                    )}
                  />
                ) : null}
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  className="sm:flex-1"
                  disabled={busy}
                  onClick={() => void onSaveDraft()}
                >
                  {isSavingDraft ? "Saving..." : "Save as Draft"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="sm:flex-1"
                  disabled={busy}
                  onClick={() => void onSendTest()}
                >
                  {isTesting ? "Sending test..." : "Send Test to Me"}
                </Button>
                <Button
                  type="submit"
                  className="sm:flex-1"
                  disabled={busy}
                >
                  {isSubmitting
                    ? deliveryMode === "scheduled"
                      ? "Scheduling..."
                      : "Queued..."
                    : deliveryMode === "scheduled"
                      ? "Schedule Notification"
                      : "Send Notification"}
                </Button>
              </div>
            </div>
          </FormSectionCard>
        </form>
      </div>

      {showHistory ? (
        <div
          ref={historyRef}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#1A1A1A]">
                Notification History
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Live campaign status, audience, and delivery stats.
              </p>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#64748B]">
              No notifications yet. Send your first broadcast above.
            </p>
          ) : (
            <NotificationHistoryTable
              notifications={history}
              onSendDraft={onSendDraft}
              sendingDraftId={sendingDraftId}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
