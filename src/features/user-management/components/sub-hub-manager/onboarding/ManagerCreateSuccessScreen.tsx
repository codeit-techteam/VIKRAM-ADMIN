"use client";

import Link from "next/link";
import { Building2, CheckCircle2, LayoutList, Plus, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { CreateManagerResult } from "@/features/user-management/types/manager-onboarding.types";

interface ManagerCreateSuccessScreenProps {
  result: CreateManagerResult;
  onCreateAnother: () => void;
}

export function ManagerCreateSuccessScreen({
  result,
  onCreateAnother,
}: ManagerCreateSuccessScreenProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 flex size-24 items-center justify-center rounded-full border-4 border-orange-200 bg-orange-50">
        <CheckCircle2 className="text-primary size-12" />
      </div>

      <h1 className="text-2xl font-bold text-[#1A1A1A]">
        Manager Provisioned Successfully!
      </h1>
      <p className="mt-2 max-w-lg text-sm text-[#64748B]">
        <span className="font-semibold text-[#1A1A1A]">{result.name}</span> (ID:{" "}
        {result.employeeId}) has been assigned as Sub-Hub Manager for{" "}
        <span className="font-semibold text-[#1A1A1A]">{result.hubName}</span>.
      </p>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Access Level"
          value="Sub Hub Manager"
          sub="Tier 2 Administrative Privileges"
        />
        <SummaryCard
          title="Assigned Node"
          value={result.hubCode}
          sub="Active since today"
        />
        <SummaryCard
          title="Credentials Sent"
          value="Provisioned"
          sub={result.credentialsSent ? "Email & SMS Dispatched" : "Pending"}
          subClassName="text-emerald-600"
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          className="h-11 gap-2 px-6"
          render={<Link href={`${ROUTES.SUB_HUB_MANAGERS}/${result.id}`} />}
        >
          <User className="size-4" />
          View Manager Profile
        </Button>
        <Button
          variant="outline"
          className="h-11 gap-2 px-6"
          render={<Link href={ROUTES.SUB_HUB_MANAGERS} />}
        >
          <LayoutList className="size-4" />
          Go to Manager List
        </Button>
        <Button
          variant="secondary"
          className="h-11 gap-2 px-6"
          onClick={onCreateAnother}
        >
          <Plus className="size-4" />
          Create Another Manager
        </Button>
      </div>

      <div className="mt-12 flex items-center gap-2 text-xs text-gray-400">
        <Building2 className="size-3.5" />
        <span>BuildQuick ERP · System Live: Ready</span>
        <span className="size-1.5 rounded-full bg-emerald-500" />
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  sub,
  subClassName,
}: {
  title: string;
  value: string;
  sub: string;
  subClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 text-left shadow-sm">
      <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        {title}
      </p>
      <p className="mt-2 text-lg font-bold text-[#1A1A1A]">{value}</p>
      <p className={`mt-1 text-xs text-gray-500 ${subClassName ?? ""}`}>
        {sub}
      </p>
    </div>
  );
}
