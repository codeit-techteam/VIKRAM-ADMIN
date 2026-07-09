"use client";

import { User } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ManagerOnboardingSchema } from "@/features/user-management/schema/manager-onboarding.schema";
import { getProgressPercent } from "@/mock/manager-onboarding";
import { cn } from "@/lib/utils";

interface ManagerWizardPreviewProps {
  currentStep: number;
  variant?: "default" | "credentials" | "documents" | "hub";
}

export function ManagerWizardPreview({
  currentStep,
  variant = "default",
}: ManagerWizardPreviewProps) {
  const { control } = useFormContext<ManagerOnboardingSchema>();

  const fullName = useWatch({ control, name: "fullName" });
  const employeeId = useWatch({ control, name: "employeeId" });
  const email = useWatch({ control, name: "email" });
  const phone = useWatch({ control, name: "phone" });
  const profilePhoto = useWatch({ control, name: "profilePhoto" });
  const department = useWatch({ control, name: "department" });
  const employeeType = useWatch({ control, name: "employeeType" });
  const joiningDate = useWatch({ control, name: "joiningDate" });
  const reportingManagerName = useWatch({
    control,
    name: "reportingManagerName",
  });
  const hubName = useWatch({ control, name: "hubName" });
  const hubCode = useWatch({ control, name: "hubCode" });
  const username = useWatch({ control, name: "username" });
  const credentialsGenerated = useWatch({
    control,
    name: "credentialsGenerated",
  });
  const documents = useWatch({ control, name: "documents" });
  const permissionTemplate = useWatch({ control, name: "permissionTemplate" });

  const progress = getProgressPercent(currentStep);
  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const uploadedCount = documents
    ? Object.values(documents).filter(Boolean).length
    : 0;

  return (
    <aside className="w-full shrink-0 xl:w-72">
      <div className="space-y-4 xl:sticky xl:top-4">
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="bg-primary px-4 py-2">
            <p className="text-[10px] font-semibold tracking-wider text-white/90 uppercase">
              Live Preview
            </p>
          </div>
          <div className="p-4">
            <div className="mb-4 flex flex-col items-center text-center">
              <Avatar className="size-16 border-2 border-orange-100">
                {profilePhoto ? (
                  <AvatarImage src={profilePhoto} alt={fullName} />
                ) : null}
                <AvatarFallback className="bg-orange-50 text-lg font-semibold text-[#9A3412]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <p className="mt-3 text-sm font-semibold text-[#1A1A1A]">
                {fullName || "[Pending]"}
              </p>
              <p className="text-xs text-gray-500">
                {employeeType === "sub-hub-manager"
                  ? "Sub Hub Manager"
                  : "Manager Candidate"}
              </p>
            </div>

            <div className="space-y-2.5 text-sm">
              <PreviewRow label="ID" value={employeeId || "—"} />
              {variant === "default" && (
                <>
                  <PreviewRow label="Email" value={email || "—"} />
                  <PreviewRow
                    label="Phone"
                    value={phone ? `+91 ${phone}` : "—"}
                  />
                </>
              )}
              {variant === "hub" && hubName && (
                <PreviewRow label="Hub" value={hubName} />
              )}
              {variant === "credentials" && (
                <>
                  <PreviewRow
                    label="Username"
                    value={username || "Not generated"}
                  />
                  <PreviewRow label="Hub" value={hubName || "Not assigned"} />
                </>
              )}
              {variant === "documents" && (
                <PreviewRow
                  label="Documents"
                  value={`${uploadedCount} / 6 uploaded`}
                />
              )}
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Profile Status</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1.5 text-xs",
                    credentialsGenerated
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      credentialsGenerated ? "bg-emerald-500" : "bg-amber-500",
                    )}
                  />
                  {credentialsGenerated ? "Ready" : "Draft in Progress"}
                </Badge>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-gray-500">
                  <span>Onboarding Progress</span>
                  <span className="font-medium text-[#1A1A1A]">
                    {progress}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {(department || joiningDate || reportingManagerName) &&
          currentStep >= 2 && (
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Employment
              </p>
              <div className="space-y-2 text-sm">
                {department && (
                  <PreviewRow
                    label="Department"
                    value={
                      department.charAt(0).toUpperCase() +
                      department.slice(1).replace("-", " ")
                    }
                  />
                )}
                {joiningDate && (
                  <PreviewRow label="Joining" value={joiningDate} />
                )}
                {reportingManagerName && (
                  <PreviewRow label="Reports To" value={reportingManagerName} />
                )}
              </div>
            </div>
          )}

        {hubName && currentStep >= 3 && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
            <div className="flex items-start gap-2">
              <User className="mt-0.5 size-4 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Hub Assigned
                </p>
                <p className="text-xs text-emerald-700">
                  {hubName} ({hubCode})
                </p>
              </div>
            </div>
          </div>
        )}

        {permissionTemplate && currentStep === 4 && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <p className="text-xs font-semibold text-blue-800">RBAC Tip</p>
            <p className="mt-1 text-xs text-blue-700">
              Permissions are inherited from the selected role template. You can
              edit access later from User Management.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-gray-400 uppercase">{label}</span>
      <span className="text-right text-xs font-medium text-[#1A1A1A]">
        {value}
      </span>
    </div>
  );
}
