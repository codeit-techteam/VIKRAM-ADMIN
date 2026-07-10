"use client";

import {
  CreditCard,
  FileText,
  MapPin,
  Phone,
  Shield,
  Truck,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FleetTimeline } from "@/features/logistics/components/shared/FleetTimeline";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import { formatLogisticsDate } from "@/mock/logistics";
import type { LogisticsDriver } from "@/types/logistics.types";

interface DriverDetailDrawerProps {
  driver: LogisticsDriver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs text-gray-400 uppercase">{label}</span>
      <span className="text-right text-sm font-medium text-[#1A1A1A]">
        {value ?? "—"}
      </span>
    </div>
  );
}

function getLicenseStatus(expiry: string): {
  label: string;
  variant: "success" | "warning" | "danger";
} {
  const days = Math.ceil(
    (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return { label: "Expired", variant: "danger" };
  if (days < 30) return { label: "Expiring Soon", variant: "warning" };
  return { label: "Valid", variant: "success" };
}

export function DriverDetailDrawer({
  driver,
  open,
  onOpenChange,
}: DriverDetailDrawerProps) {
  if (!driver) return null;

  const licenseStatus = getLicenseStatus(driver.licenseExpiry);
  const docEntries = [
    { label: "Driving License", doc: driver.documents?.drivingLicense },
    { label: "Aadhaar", doc: driver.documents?.aadhaar },
    { label: "PAN", doc: driver.documents?.pan },
    { label: "Police Verification", doc: driver.documents?.policeVerification },
    { label: "Medical Certificate", doc: driver.documents?.medicalCertificate },
  ].filter((d) => d.doc);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-[#1A1A1A]">{driver.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {driver.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-gray-500">{driver.employeeId}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <LogisticsStatusBadge status={driver.status} />
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    licenseStatus.variant === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : licenseStatus.variant === "warning"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700"
                  }`}
                >
                  License {licenseStatus.label}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1 rounded-xl border border-gray-100 bg-[#F8F9FB] p-4">
            <div className="flex items-start gap-3 border-b border-gray-100 pb-3">
              <Shield className="text-primary mt-0.5 size-4" />
              <div className="flex-1 space-y-1">
                <DetailRow label="License No." value={driver.licenseNumber} />
                <DetailRow
                  label="License Expiry"
                  value={formatLogisticsDate(driver.licenseExpiry)}
                />
                {driver.licenseType ? (
                  <DetailRow label="License Type" value={driver.licenseType} />
                ) : null}
              </div>
            </div>
            <div className="flex items-start gap-3 border-b border-gray-100 py-3">
              <Truck className="text-primary mt-0.5 size-4" />
              <div className="flex-1">
                <DetailRow
                  label="Assigned Vehicle"
                  value={driver.assignedVehicleNumber ?? "None"}
                />
              </div>
            </div>
            <div className="flex items-start gap-3 border-b border-gray-100 py-3">
              <MapPin className="text-primary mt-0.5 size-4" />
              <div className="flex-1 space-y-1">
                <DetailRow label="Warehouse" value={driver.assignedWarehouse} />
                <DetailRow label="Hub" value={driver.assignedHub} />
              </div>
            </div>
            <div className="flex items-start gap-3 pt-3">
              <User className="text-primary mt-0.5 size-4" />
              <div className="flex-1 space-y-1">
                <DetailRow
                  label="Trips Completed"
                  value={String(driver.tripsCompleted ?? driver.tripsToday)}
                />
                <DetailRow
                  label="Trips Today"
                  value={String(driver.tripsToday)}
                />
              </div>
            </div>
          </div>

          {(driver.emergencyContactName || driver.emergencyContactNumber) && (
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                <Phone className="size-3.5" />
                Emergency Contact
              </p>
              <div className="rounded-xl border border-gray-100 p-4">
                <DetailRow label="Name" value={driver.emergencyContactName} />
                <DetailRow
                  label="Phone"
                  value={driver.emergencyContactNumber}
                />
                <DetailRow
                  label="Relationship"
                  value={driver.emergencyContactRelationship}
                />
              </div>
            </div>
          )}

          {driver.banking ? (
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                <CreditCard className="size-3.5" />
                Banking
              </p>
              <div className="rounded-xl border border-gray-100 p-4">
                <DetailRow
                  label="Account Holder"
                  value={driver.banking.accountHolder}
                />
                <DetailRow label="Bank" value={driver.banking.bankName} />
                <DetailRow label="IFSC" value={driver.banking.ifscCode} />
              </div>
            </div>
          ) : null}

          {docEntries.length > 0 ? (
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                <FileText className="size-3.5" />
                Documents
              </p>
              <div className="space-y-2">
                {docEntries.map((d) => (
                  <div
                    key={d.label}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                  >
                    <FileText className="text-primary size-4" />
                    <div>
                      <p className="text-sm font-medium">{d.label}</p>
                      <p className="text-xs text-gray-400">{d.doc?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {driver.timeline && driver.timeline.length > 0 ? (
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Timeline
              </p>
              <FleetTimeline events={driver.timeline} />
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
