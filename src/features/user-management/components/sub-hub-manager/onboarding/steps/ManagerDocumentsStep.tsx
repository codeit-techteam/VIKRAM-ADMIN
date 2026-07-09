"use client";

import { Eye, FileText, Trash2, Upload } from "lucide-react";
import { useCallback } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ManagerOnboardingSchema } from "@/features/user-management/schema/manager-onboarding.schema";
import type { ManagerDocumentFile } from "@/features/user-management/types/manager-onboarding.types";
import { DOCUMENT_DEFINITIONS } from "@/mock/manager-onboarding";
import { useManagerDraftStore } from "@/store/manager-draft-store";
import { notify } from "@/utils/notify";
import { ManagerWizardPreview } from "../ManagerWizardPreview";
import { StepHeader } from "./ManagerBasicInfoStep";
import { cn } from "@/lib/utils";

export function ManagerDocumentsStep() {
  const { control } = useFormContext<ManagerOnboardingSchema>();
  const updateDocuments = useManagerDraftStore((s) => s.updateDocuments);

  const documents = useWatch({ control, name: "documents" });

  const requiredDocs = DOCUMENT_DEFINITIONS.filter((d) => d.required);
  const requiredUploaded = requiredDocs.filter(
    (d) => documents?.[d.key],
  ).length;
  const totalUploaded = documents
    ? Object.values(documents).filter(Boolean).length
    : 0;

  const handleUpload = useCallback(
    (key: keyof ManagerOnboardingSchema["documents"], file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const doc: ManagerDocumentFile = {
          name: file.name,
          size: file.size,
          previewUrl: reader.result as string,
          uploadedAt: new Date().toISOString(),
        };
        updateDocuments({ [key]: doc });
        notify.success(
          "Document Uploaded",
          `${file.name} uploaded successfully.`,
        );
      };
      reader.readAsDataURL(file);
    },
    [updateDocuments],
  );

  const handleDelete = (key: keyof ManagerOnboardingSchema["documents"]) => {
    updateDocuments({ [key]: null });
    notify.success("Document Removed", "Document has been deleted.");
  };

  const handlePreview = (doc: ManagerDocumentFile) => {
    window.open(doc.previewUrl, "_blank");
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <StepHeader
          title="KYC & Document Upload Center"
          subtitle="Step 6 of 7: Upload identity and employment documents."
          step={6}
        />

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-sm text-blue-800">
          Accepted formats: PDF, JPG, PNG. Maximum file size: 5MB per document.
        </div>

        <FormSectionCard icon={FileText} title="Document Upload">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DOCUMENT_DEFINITIONS.map((def) => {
              const doc = documents?.[def.key];
              return (
                <DocumentCard
                  key={def.key}
                  label={def.label}
                  required={def.required}
                  doc={doc}
                  onUpload={(file) => handleUpload(def.key, file)}
                  onDelete={() => handleDelete(def.key)}
                  onPreview={() => doc && handlePreview(doc)}
                />
              );
            })}
          </div>
        </FormSectionCard>
      </div>

      <aside className="w-full shrink-0 xl:w-72">
        <div className="space-y-4 xl:sticky xl:top-4">
          <ManagerWizardPreview currentStep={6} variant="documents" />

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Verification Status
            </p>
            <div className="mb-3">
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {totalUploaded} / 6 Uploaded
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${(totalUploaded / 6) * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <ChecklistItem
                done={requiredUploaded >= 2}
                label="Personal Identity Verified"
                sub="Aadhaar and PAN"
              />
              <ChecklistItem
                done={!!documents?.offerLetter}
                label="Employment Proofs"
                sub={
                  documents?.offerLetter
                    ? "Offer Letter uploaded"
                    : "Awaiting Offer Letter"
                }
              />
              <ChecklistItem
                done={!!documents?.policeVerification}
                label="Background Check"
                sub={
                  documents?.policeVerification
                    ? "Police clearance uploaded"
                    : "Awaiting Police Clearance"
                }
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function DocumentCard({
  label,
  required,
  doc,
  onUpload,
  onDelete,
  onPreview,
}: {
  label: string;
  required: boolean;
  doc: ManagerDocumentFile | null | undefined;
  onUpload: (file: File) => void;
  onDelete: () => void;
  onPreview: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        doc
          ? "border-emerald-100 bg-emerald-50/30"
          : "border-dashed border-gray-200 bg-gray-50/50",
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#1A1A1A]">{label}</p>
          {required && (
            <span className="text-destructive text-[10px] font-medium">
              Required
            </span>
          )}
        </div>
        {doc && (
          <Badge className="bg-emerald-100 text-[10px] text-emerald-700">
            UPLOADED
          </Badge>
        )}
      </div>

      {doc ? (
        <div className="space-y-3">
          <p className="truncate text-xs text-gray-500">{doc.name}</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 flex-1 gap-1.5"
              onClick={onPreview}
            >
              <Eye className="size-3.5" />
              View
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-red-600 hover:text-red-700"
              onClick={onDelete}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
          <label className="block">
            <span className="text-primary cursor-pointer text-xs font-medium hover:underline">
              Replace file
            </span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
              }}
            />
          </label>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center gap-2 py-4">
          <Upload className="size-6 text-gray-400" />
          <span className="text-xs text-gray-500">Click to upload</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </label>
      )}
    </div>
  );
}

function ChecklistItem({
  done,
  label,
  sub,
}: {
  done: boolean;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[10px]",
          done ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400",
        )}
      >
        {done ? "✓" : "·"}
      </span>
      <div>
        <p
          className={cn(
            "text-sm font-medium",
            done ? "text-emerald-700" : "text-gray-600",
          )}
        >
          {label}
        </p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
    </div>
  );
}
