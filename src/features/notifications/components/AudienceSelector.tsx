"use client";

import { useMemo } from "react";
import { X } from "lucide-react";

import { PillRadioGroup } from "@/components/shared/PillRadioGroup";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AUDIENCE_CITY_HUB_OPTIONS,
  AUDIENCE_SEGMENT_OPTIONS,
} from "@/features/notifications/constants/notification.mock";
import type { AudienceType } from "@/features/notifications/types/notification.types";
import { cn } from "@/lib/utils";

const AUDIENCE_OPTIONS: { value: AudienceType; label: string }[] = [
  { value: "all", label: "All Users" },
  { value: "city_hub", label: "By City or Hub" },
  { value: "segment", label: "By User Segment" },
  { value: "custom_list", label: "Custom List" },
];

interface AudienceSelectorProps {
  audienceType: AudienceType;
  audienceTargets: string[];
  onAudienceTypeChange: (value: AudienceType) => void;
  onAudienceTargetsChange: (targets: string[]) => void;
  className?: string;
}

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

export function AudienceSelector({
  audienceType,
  audienceTargets,
  onAudienceTypeChange,
  onAudienceTargetsChange,
  className,
}: AudienceSelectorProps) {
  const availableCityOptions = useMemo(
    () =>
      AUDIENCE_CITY_HUB_OPTIONS.filter(
        (option) => !audienceTargets.includes(option.value),
      ),
    [audienceTargets],
  );

  const availableSegmentOptions = useMemo(
    () =>
      AUDIENCE_SEGMENT_OPTIONS.filter(
        (option) => !audienceTargets.includes(option.value),
      ),
    [audienceTargets],
  );

  const handleAddTarget = (value: string | null) => {
    if (!value || audienceTargets.includes(value)) {
      return;
    }

    onAudienceTargetsChange([...audienceTargets, value]);
  };

  const handleRemoveTarget = (value: string) => {
    onAudienceTargetsChange(
      audienceTargets.filter((target) => target !== value),
    );
  };

  const getTargetLabel = (value: string): string => {
    const cityLabel = AUDIENCE_CITY_HUB_OPTIONS.find(
      (option) => option.value === value,
    )?.label;
    if (cityLabel) {
      return cityLabel;
    }

    const segmentLabel = AUDIENCE_SEGMENT_OPTIONS.find(
      (option) => option.value === value,
    )?.label;
    if (segmentLabel) {
      return segmentLabel;
    }

    return value;
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Label className={fieldLabelClassName}>Target Audience</Label>
      <PillRadioGroup
        name="audience-type"
        options={AUDIENCE_OPTIONS}
        value={audienceType}
        onChange={(value) => {
          onAudienceTypeChange(value);
          onAudienceTargetsChange([]);
        }}
      />

      {audienceType === "city_hub" ? (
        <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/60 p-4">
          <Label className={fieldLabelClassName}>Select Cities / Hubs</Label>
          <Select value={null} onValueChange={handleAddTarget}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Add city or hub" />
            </SelectTrigger>
            <SelectContent>
              {availableCityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {audienceTargets.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {audienceTargets.map((target) => (
                <span
                  key={target}
                  className="text-primary inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium"
                >
                  {getTargetLabel(target)}
                  <button
                    type="button"
                    onClick={() => handleRemoveTarget(target)}
                    className="rounded-full p-0.5 hover:bg-orange-100"
                    aria-label={`Remove ${getTargetLabel(target)}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              Choose one or more cities or hubs to target.
            </p>
          )}
        </div>
      ) : null}

      {audienceType === "segment" ? (
        <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/60 p-4">
          <Label className={fieldLabelClassName}>User Segments</Label>
          <Select value={null} onValueChange={handleAddTarget}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Add user segment" />
            </SelectTrigger>
            <SelectContent>
              {availableSegmentOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {audienceTargets.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {audienceTargets.map((target) => (
                <span
                  key={target}
                  className="text-primary inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium"
                >
                  {getTargetLabel(target)}
                  <button
                    type="button"
                    onClick={() => handleRemoveTarget(target)}
                    className="rounded-full p-0.5 hover:bg-orange-100"
                    aria-label={`Remove ${getTargetLabel(target)}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              Target New, Active, or Dormant user segments.
            </p>
          )}
        </div>
      ) : null}

      {audienceType === "custom_list" ? (
        <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/60 p-4">
          <Label className={fieldLabelClassName}>Custom User List</Label>
          <Select value={null} onValueChange={handleAddTarget}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Add list tag" />
            </SelectTrigger>
            <SelectContent>
              {["vip-contractors", "bulk-buyers", "pilot-beta"]
                .filter((tag) => !audienceTargets.includes(tag))
                .map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {audienceTargets.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {audienceTargets.map((target) => (
                <span
                  key={target}
                  className="text-primary inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium"
                >
                  {getTargetLabel(target)}
                  <button
                    type="button"
                    onClick={() => handleRemoveTarget(target)}
                    className="rounded-full p-0.5 hover:bg-orange-100"
                    aria-label={`Remove ${getTargetLabel(target)}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              Add tags from your saved custom audience lists.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
