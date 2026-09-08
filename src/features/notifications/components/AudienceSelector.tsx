"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { PillRadioGroup } from "@/components/shared/PillRadioGroup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AudienceOption,
  AudienceType,
  PushComposerOptions,
} from "@/features/notifications/types/notification.types";
import { notificationsService } from "@/services/cms-notifications.service";
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
  options?: PushComposerOptions | null;
  className?: string;
}

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

export function AudienceSelector({
  audienceType,
  audienceTargets,
  onAudienceTypeChange,
  onAudienceTargetsChange,
  options,
  className,
}: AudienceSelectorProps) {
  const cityHubOptions = useMemo(() => {
    const hubs = (options?.hubs ?? []).map((hub) => ({
      id: hub.id,
      label: hub.label,
    }));
    const cities = (options?.cities ?? []).map((city) => ({
      id: city.id,
      label: city.label,
    }));
    return [...cities, ...hubs];
  }, [options]);

  const segmentOptions = options?.segments ?? [];

  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<AudienceOption[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<
    Record<string, AudienceOption>
  >({});

  useEffect(() => {
    if (audienceType !== "custom_list") return;
    const q = customerQuery.trim();
    if (q.length < 2) {
      setCustomerResults([]);
      return;
    }
    const handle = window.setTimeout(() => {
      void notificationsService.searchCustomers(q).then((rows) => {
        setCustomerResults(
          rows.filter((row) => !audienceTargets.includes(row.id)),
        );
      });
    }, 250);
    return () => window.clearTimeout(handle);
  }, [audienceType, customerQuery, audienceTargets]);

  const handleAddTarget = (value: string | null, meta?: AudienceOption) => {
    if (!value || audienceTargets.includes(value)) return;
    if (meta) {
      setSelectedCustomers((current) => ({ ...current, [value]: meta }));
    }
    onAudienceTargetsChange([...audienceTargets, value]);
  };

  const handleRemoveTarget = (value: string) => {
    onAudienceTargetsChange(
      audienceTargets.filter((target) => target !== value),
    );
  };

  const getTargetLabel = (value: string): string => {
    const cityHub = cityHubOptions.find((option) => option.id === value);
    if (cityHub) return cityHub.label;
    const segment = segmentOptions.find((option) => option.id === value);
    if (segment) return segment.label;
    return selectedCustomers[value]?.label ?? value;
  };

  const availableCityOptions = cityHubOptions.filter(
    (option) => !audienceTargets.includes(option.id),
  );
  const availableSegmentOptions = segmentOptions.filter(
    (option) => !audienceTargets.includes(option.id),
  );

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
          <Select value={null} onValueChange={(value) => handleAddTarget(value)}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Add city or hub" />
            </SelectTrigger>
            <SelectContent>
              {availableCityOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {audienceTargets.length > 0 ? (
            <TargetChips
              targets={audienceTargets}
              getLabel={getTargetLabel}
              onRemove={handleRemoveTarget}
            />
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
          <Select value={null} onValueChange={(value) => handleAddTarget(value)}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Add user segment" />
            </SelectTrigger>
            <SelectContent>
              {availableSegmentOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {audienceTargets.length > 0 ? (
            <TargetChips
              targets={audienceTargets}
              getLabel={getTargetLabel}
              onRemove={handleRemoveTarget}
            />
          ) : (
            <p className="text-xs text-gray-400">
              Target New, Active, Dormant, or role-based segments.
            </p>
          )}
        </div>
      ) : null}

      {audienceType === "custom_list" ? (
        <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/60 p-4">
          <Label className={fieldLabelClassName}>Particular Users</Label>
          <Input
            value={customerQuery}
            onChange={(event) => setCustomerQuery(event.target.value)}
            placeholder="Search by name or phone"
          />
          {customerResults.length > 0 ? (
            <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200 bg-white">
              {customerResults.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-orange-50"
                  onClick={() => {
                    handleAddTarget(row.id, row);
                    setCustomerQuery("");
                    setCustomerResults([]);
                  }}
                >
                  <span className="font-medium text-[#1A1A1A]">{row.label}</span>
                  <span className="text-xs text-[#64748B]">{row.phone}</span>
                </button>
              ))}
            </div>
          ) : null}
          {audienceTargets.length > 0 ? (
            <TargetChips
              targets={audienceTargets}
              getLabel={getTargetLabel}
              onRemove={handleRemoveTarget}
            />
          ) : (
            <p className="text-xs text-gray-400">
              Search and add individual customers. Only they will receive this
              notification.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function TargetChips({
  targets,
  getLabel,
  onRemove,
}: {
  targets: string[];
  getLabel: (value: string) => string;
  onRemove: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {targets.map((target) => (
        <span
          key={target}
          className="text-primary inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium"
        >
          {getLabel(target)}
          <button
            type="button"
            onClick={() => onRemove(target)}
            className="rounded-full p-0.5 hover:bg-orange-100"
            aria-label={`Remove ${getLabel(target)}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
