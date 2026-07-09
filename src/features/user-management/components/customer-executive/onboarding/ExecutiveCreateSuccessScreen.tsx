"use client";

import Link from "next/link";
import { CheckCircle2, LayoutList, Plus, User, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { CreateExecutiveResult } from "@/features/user-management/types/executive-onboarding.types";

interface ExecutiveCreateSuccessScreenProps {
  result: CreateExecutiveResult;
  onCreateAnother: () => void;
}

export function ExecutiveCreateSuccessScreen({
  result,
  onCreateAnother,
}: ExecutiveCreateSuccessScreenProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 flex size-24 items-center justify-center rounded-full border-4 border-emerald-200 bg-emerald-50">
        <CheckCircle2 className="size-12 text-emerald-600" />
      </div>

      <h1 className="text-2xl font-bold text-[#1A1A1A]">
        Customer Executive Created Successfully!
      </h1>
      <p className="mt-2 max-w-lg text-sm text-[#64748B]">
        <span className="font-semibold text-[#1A1A1A]">{result.name}</span> (ID:{" "}
        {result.employeeId}) has been onboarded. Credentials and permissions are
        synchronized.
      </p>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Assigned Hub"
          value={result.hubName}
          sub="Primary operational node"
        />
        <SummaryCard
          title="Assigned Region"
          value={result.region}
          sub="Territory coverage active"
        />
        <SummaryCard
          title="Credentials Sent"
          value={result.credentialsSent ? "Dispatched" : "Pending"}
          sub={
            result.credentialsSent
              ? `Username: ${result.username}`
              : "Awaiting dispatch"
          }
          subClassName={result.credentialsSent ? "text-emerald-600" : ""}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          className="h-11 gap-2 px-6"
          onClick={() =>
            window.open(`${ROUTES.CUSTOMER_EXECUTIVE}/${result.id}`, "_self")
          }
        >
          <UserPlus className="size-4" />
          Assign Customers
        </Button>
        <Button
          variant="outline"
          className="h-11 gap-2 px-6"
          render={<Link href={`${ROUTES.CUSTOMER_EXECUTIVE}/${result.id}`} />}
        >
          <User className="size-4" />
          View Executive
        </Button>
        <Button
          variant="secondary"
          className="h-11 gap-2 px-6"
          onClick={onCreateAnother}
        >
          <Plus className="size-4" />
          Create Another Executive
        </Button>
        <Button
          variant="ghost"
          className="h-11 gap-2 px-6"
          render={<Link href={ROUTES.CUSTOMER_EXECUTIVE} />}
        >
          <LayoutList className="size-4" />
          Back to List
        </Button>
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
