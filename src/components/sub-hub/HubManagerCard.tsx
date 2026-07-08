"use client";

import { Clock, Mail, Phone, UserRound } from "lucide-react";

import { DashboardCard } from "@/components/shared/DashboardCard";
import { HubHealthScoreBar } from "@/components/sub-hub/HubHealthScoreBar";
import { ProgressBar } from "@/components/shared/ProgressBar";
import type { HubManagerProfile } from "@/utils/hub-profile-metrics";

interface HubManagerCardProps {
  profile: HubManagerProfile;
}

export function HubManagerCard({ profile }: HubManagerCardProps) {
  return (
    <DashboardCard title="Hub Manager" contentClassName="mt-5 space-y-5">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 text-primary flex size-14 shrink-0 items-center justify-center rounded-full">
          <UserRound className="size-7" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-[#1A1A1A]">{profile.name}</p>
          <p className="text-sm text-[#64748B]">
            Hub Since {profile.hubSinceLabel}
          </p>
        </div>
      </div>

      <dl className="space-y-3 text-sm">
        <InfoRow
          icon={<Phone className="size-3.5" />}
          label="Phone"
          value={profile.phone}
        />
        <InfoRow
          icon={<Mail className="size-3.5" />}
          label="Email"
          value={profile.email}
        />
        <InfoRow
          icon={<Clock className="size-3.5" />}
          label="Working Hours"
          value={profile.workingHours}
        />
      </dl>

      <div className="grid grid-cols-2 gap-3">
        <MetricChip label="Capacity" value={profile.capacityLabel} />
        <MetricChip
          label="Active Orders"
          value={String(profile.activeOrders)}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-[#64748B]">Storage Utilization</span>
          <span className="font-semibold text-[#1A1A1A] tabular-nums">
            {profile.storageUtilization}%
          </span>
        </div>
        <ProgressBar value={profile.storageUtilization} showLabel={false} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-[#64748B]">Performance Score</span>
        </div>
        <HubHealthScoreBar score={profile.performanceScore} />
      </div>
    </DashboardCard>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-gray-400">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs text-gray-400">{label}</dt>
        <dd className="truncate font-medium text-[#1A1A1A]">{value}</dd>
      </div>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2.5">
      <p className="text-[11px] tracking-wide text-gray-400 uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">{value}</p>
    </div>
  );
}
