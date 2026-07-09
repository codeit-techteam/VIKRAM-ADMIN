"use client";

import {
  Briefcase,
  CheckCircle2,
  FileText,
  KeyRound,
  MapPin,
  Pencil,
  Shield,
  User,
} from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import type { ExecutiveOnboardingSchema } from "@/features/user-management/schema/executive-onboarding.schema";
import {
  BRANCH_OFFICE_OPTIONS,
  getCityById,
  getStateById,
  getZoneById,
  RESPONSIBILITY_CARDS,
} from "@/mock/executive-onboarding";
import { StepHeader } from "./ExecutiveBasicInfoStep";

interface ExecutiveReviewStepProps {
  onEditStep: (step: number) => void;
}

export function ExecutiveReviewStep({ onEditStep }: ExecutiveReviewStepProps) {
  const { control } = useFormContext<ExecutiveOnboardingSchema>();

  const data = {
    fullName: useWatch({ control, name: "fullName" }),
    email: useWatch({ control, name: "email" }),
    phone: useWatch({ control, name: "phone" }),
    employeeId: useWatch({ control, name: "employeeId" }),
    gender: useWatch({ control, name: "gender" }),
    branchOffice: useWatch({ control, name: "branchOffice" }),
    joiningDate: useWatch({ control, name: "joiningDate" }),
    reportingHubName: useWatch({ control, name: "reportingHubName" }),
    state: useWatch({ control, name: "state" }),
    city: useWatch({ control, name: "city" }),
    zone: useWatch({ control, name: "zone" }),
    assignedHubNames: useWatch({ control, name: "assignedHubNames" }),
    responsibilities: useWatch({ control, name: "responsibilities" }),
    username: useWatch({ control, name: "username" }),
    corporateEmail: useWatch({ control, name: "corporateEmail" }),
    documents: useWatch({ control, name: "documents" }),
  };

  const activeResponsibilities = RESPONSIBILITY_CARDS.filter(
    (c) => data.responsibilities?.[c.key],
  ).map((c) => c.label);

  const uploadedDocs = data.documents
    ? Object.entries(data.documents)
        .filter(([, v]) => v)
        .map(([k, v]) => ({ key: k, name: v!.name }))
    : [];

  const branchLabel =
    BRANCH_OFFICE_OPTIONS.find((b) => b.value === data.branchOffice)?.label ??
    data.branchOffice;

  return (
    <div className="space-y-6">
      <StepHeader
        title="Final Review"
        subtitle="Step 7 of 7: Review all information before creating the customer executive."
        step={7}
      />

      <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Ready to Create Executive
          </p>
          <p className="mt-0.5 text-sm text-emerald-700">
            No validation errors found. Executive profile is ready for
            provisioning.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ReviewCard
          icon={User}
          title="Basic Info"
          onEdit={() => onEditStep(1)}
          rows={[
            { label: "Full Name", value: data.fullName },
            { label: "Employee ID", value: data.employeeId },
            { label: "Email", value: data.email },
            { label: "Phone", value: data.phone ? `+91 ${data.phone}` : "—" },
            {
              label: "Gender",
              value: data.gender
                ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1)
                : "—",
            },
          ]}
        />

        <ReviewCard
          icon={Briefcase}
          title="Office"
          onEdit={() => onEditStep(2)}
          rows={[
            { label: "Type", value: "Customer Executive" },
            { label: "Branch", value: branchLabel || "—" },
            { label: "Department", value: "Customer Operations" },
            { label: "Joining Date", value: data.joiningDate || "—" },
            {
              label: "Reporting Hub",
              value: data.reportingHubName || "—",
            },
          ]}
        />

        <ReviewCard
          icon={MapPin}
          title="Area"
          onEdit={() => onEditStep(3)}
          rows={[
            {
              label: "State",
              value: data.state ? getStateById(data.state)?.name : "—",
            },
            {
              label: "City",
              value: data.city ? getCityById(data.city)?.name : "—",
            },
            {
              label: "Zone",
              value: data.zone ? getZoneById(data.zone)?.name : "—",
            },
            {
              label: "Assigned Hubs",
              value: data.assignedHubNames?.join(", ") || "—",
            },
          ]}
        />

        <ReviewCard
          icon={Shield}
          title="Responsibilities"
          onEdit={() => onEditStep(4)}
          rows={activeResponsibilities.map((label) => ({
            label: "Module",
            value: label,
          }))}
        />

        <ReviewCard
          icon={KeyRound}
          title="Credentials"
          onEdit={() => onEditStep(5)}
          rows={[
            { label: "Username", value: data.username || "—" },
            { label: "Corporate Email", value: data.corporateEmail || "—" },
          ]}
        />

        <ReviewCard
          icon={FileText}
          title="Documents"
          onEdit={() => onEditStep(6)}
          rows={
            uploadedDocs.length > 0
              ? uploadedDocs.map((d) => ({
                  label: d.key,
                  value: d.name,
                }))
              : [{ label: "Status", value: "No documents uploaded" }]
          }
        />
      </div>
    </div>
  );
}

function ReviewCard({
  icon: Icon,
  title,
  onEdit,
  rows,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onEdit: () => void;
  rows: Array<{ label: string; value: string | undefined }>;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-[#9A3412]" />
          <h3 className="text-sm font-semibold text-[#1A1A1A]">{title}</h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-gray-500"
          onClick={onEdit}
        >
          <Pencil className="size-3" />
          Edit
        </Button>
      </div>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-500">{row.label}</span>
            <span className="max-w-[60%] text-right font-medium text-[#1A1A1A]">
              {row.value || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
