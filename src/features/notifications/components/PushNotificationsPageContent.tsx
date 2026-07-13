"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  DEEP_LINK_CATEGORY_OPTIONS,
  DEEP_LINK_OFFER_OPTIONS,
  DEEP_LINK_OPTIONS,
  DEEP_LINK_PRODUCT_OPTIONS,
  PUSH_NOTIFICATION_HISTORY,
  PUSH_NOTIFICATION_STATS,
} from "@/features/notifications/constants/notification.mock";
import {
  pushNotificationSchema,
  type PushNotificationSchema,
} from "@/features/notifications/schema/push-notification.schema";
import type {
  AudienceType,
  DeepLinkTarget,
  DeliveryMode,
} from "@/features/notifications/types/notification.types";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

const DELIVERY_OPTIONS: { value: DeliveryMode; label: string }[] = [
  { value: "now", label: "Send Now" },
  { value: "scheduled", label: "Schedule for Later" },
];

function formatSubscriberCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toString();
}

export function PushNotificationsPageContent() {
  const composerRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [uploadFile, setUploadFile] = useState<MockUploadFile | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imagePreviewUrlRef = useRef<string | null>(null);

  const { control, handleSubmit, watch, setValue } =
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
      setValue("imageUrl", file.name);
      return;
    }

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

  const onSubmit = (data: PushNotificationSchema) => {
    console.log("Push notification:", data);
  };

  const deepLinkSecondaryOptions =
    deepLinkTarget === "product"
      ? DEEP_LINK_PRODUCT_OPTIONS
      : deepLinkTarget === "offer"
        ? DEEP_LINK_OFFER_OPTIONS
        : deepLinkTarget === "category"
          ? DEEP_LINK_CATEGORY_OPTIONS
          : [];

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
          value={PUSH_NOTIFICATION_STATS.totalSentThisMonth}
          subtext="This month"
          icon={Send}
          iconContainerClassName="bg-orange-50"
          iconClassName="text-primary"
        />
        <StatCard
          label="Avg. Open Rate"
          value={`${PUSH_NOTIFICATION_STATS.avgOpenRatePercent}%`}
          icon={BellRing}
          iconContainerClassName="bg-emerald-50"
          iconClassName="text-emerald-600"
        />
        <StatCard
          label="Active Subscribers"
          value={formatSubscriberCount(
            PUSH_NOTIFICATION_STATS.activeSubscribers,
          )}
          icon={Users}
          iconContainerClassName="bg-blue-50"
          iconClassName="text-blue-600"
        />
        <StatCard
          label="Scheduled"
          value={PUSH_NOTIFICATION_STATS.scheduledCount}
          subtext="Upcoming"
          icon={CalendarClock}
          iconContainerClassName="bg-violet-50"
          iconClassName="text-violet-600"
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
                    (Optional)
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

                {deepLinkTarget === "custom_url" ? (
                  <Controller
                    name="deepLinkValue"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="https://bajriwala.in/offers/monsoon-sale"
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
                            <SelectItem key={option.value} value={option.value}>
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
                <Button type="button" variant="outline" className="sm:flex-1">
                  Save as Draft
                </Button>
                <Button type="button" variant="outline" className="sm:flex-1">
                  Send Test to Me
                </Button>
                <Button type="submit" className="sm:flex-1">
                  {deliveryMode === "scheduled"
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
                Recent broadcasts, scheduled sends, and saved drafts.
              </p>
            </div>
          </div>
          <NotificationHistoryTable notifications={PUSH_NOTIFICATION_HISTORY} />
        </div>
      ) : null}
    </div>
  );
}
