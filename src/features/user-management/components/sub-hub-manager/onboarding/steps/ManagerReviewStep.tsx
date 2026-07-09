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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ManagerOnboardingSchema } from "@/features/user-management/schema/manager-onboarding.schema";
import {
  DEPARTMENT_OPTIONS,
  PERMISSION_MODULES,
} from "@/mock/manager-onboarding";
import { StepHeader } from "./ManagerBasicInfoStep";

interface ManagerReviewStepProps {
  onEditStep: (step: number) => void;
}

export function ManagerReviewStep({ onEditStep }: ManagerReviewStepProps) {
  const { control } = useFormContext<ManagerOnboardingSchema>();

  const data = {
    fullName: useWatch({ control, name: "fullName" }),
    email: useWatch({ control, name: "email" }),
    phone: useWatch({ control, name: "phone" }),
    gender: useWatch({ control, name: "gender" }),
    employeeType: useWatch({ control, name: "employeeType" }),
    department: useWatch({ control, name: "department" }),
    joiningDate: useWatch({ control, name: "joiningDate" }),
    reportingManagerName: useWatch({ control, name: "reportingManagerName" }),
    hubName: useWatch({ control, name: "hubName" }),
    hubCode: useWatch({ control, name: "hubCode" }),
    permissions: useWatch({ control, name: "permissions" }),
    permissionsSkipped: useWatch({ control, name: "permissionsSkipped" }),
    username: useWatch({ control, name: "username" }),
    documents: useWatch({ control, name: "documents" }),
  };

  const activePermissions = PERMISSION_MODULES.filter(
    (m) => data.permissions?.[m.key],
  ).map((m) => m.label);

  const uploadedDocs = data.documents
    ? Object.entries(data.documents)
        .filter(([, v]) => v)
        .map(([k, v]) => ({ key: k, name: v!.name, size: v!.size }))
    : [];

  const deptLabel =
    DEPARTMENT_OPTIONS.find((d) => d.value === data.department)?.label ??
    data.department;

  return (
    <div className="space-y-6">
      <StepHeader
        title="Final Review"
        subtitle="Step 7 of 7: Review all information before creating the manager."
        step={7}
      />

      <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Configuration Readiness: No errors found
          </p>
          <p className="mt-0.5 text-sm text-emerald-700">
            System validation complete. Manager profile is ready for
            provisioning and ID generation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ReviewCard
          icon={User}
          title="Basic Details"
          onEdit={() => onEditStep(1)}
          rows={[
            { label: "Full Name", value: data.fullName },
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
          title="Employment"
          onEdit={() => onEditStep(2)}
          rows={[
            { label: "Employee Type", value: "Sub Hub Manager" },
            { label: "Department", value: deptLabel },
            { label: "Joining Date", value: data.joiningDate || "—" },
            {
              label: "Reporting Manager",
              value: data.reportingManagerName || "—",
            },
          ]}
        />

        <ReviewCard
          icon={MapPin}
          title="Hub Assignment"
          onEdit={() => onEditStep(3)}
          badge="Primary"
          rows={[
            { label: "Primary Hub", value: data.hubName || "—" },
            { label: "Hub Code", value: data.hubCode || "—" },
          ]}
        />

        <ReviewCard
          icon={Shield}
          title="Permissions"
          onEdit={() => onEditStep(4)}
          tags={
            data.permissionsSkipped
              ? ["Skipped — Default Role"]
              : activePermissions
          }
        />

        <ReviewCard
          icon={KeyRound}
          title="Login Credentials"
          onEdit={() => onEditStep(5)}
          rows={[{ label: "Username", value: data.username || "—" }]}
        />

        <ReviewCard
          icon={FileText}
          title="Documents"
          onEdit={() => onEditStep(6)}
          files={uploadedDocs}
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
  tags,
  files,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onEdit: () => void;
  rows?: Array<{ label: string; value: string }>;
  tags?: string[];
  files?: Array<{ key: string; name: string; size: number }>;
  badge?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-orange-50">
            <Icon className="text-primary size-4" />
          </div>
          <h3 className="text-sm font-semibold text-[#1A1A1A]">{title}</h3>
          {badge && (
            <Badge variant="outline" className="text-[10px] text-blue-600">
              {badge}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-gray-500"
          onClick={onEdit}
        >
          <Pencil className="size-3.5" />
          Edit
        </Button>
      </div>

      {rows && (
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-gray-500">{row.label}</span>
              <span className="font-medium text-[#1A1A1A]">{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {tags && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-blue-100 bg-blue-50 text-blue-700"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {files && (
        <div className="space-y-2">
          {files.length === 0 ? (
            <p className="text-sm text-gray-400">No documents uploaded</p>
          ) : (
            files.map((f) => (
              <div
                key={f.key}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate text-[#1A1A1A]">{f.name}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  {(f.size / 1024).toFixed(0)} KB
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
