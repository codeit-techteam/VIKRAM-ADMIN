"use client";

import {
  AlertTriangle,
  Crosshair,
  MapPinned,
  Minus,
  PenLine,
  Plus,
} from "lucide-react";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { computeCoverageMetrics } from "@/mock/hub-onboarding";
import type { HubFormSchema } from "@/schema/hub-form.schema";
import { useHubDraftStore } from "@/store/hub-draft-store";
import { cn } from "@/lib/utils";

export function HubCoverageStep() {
  const { control, setValue } = useFormContext<HubFormSchema>();
  const updateCoverage = useHubDraftStore((s) => s.updateCoverage);
  const updateBasic = useHubDraftStore((s) => s.updateBasic);

  const radiusKm = useWatch({ control, name: "coverage.radiusKm" }) ?? 15;
  const mode = useWatch({ control, name: "coverage.mode" });
  const pincodes = useWatch({ control, name: "coverage.pincodes" }) ?? [];
  const estimatedCustomers = useWatch({
    control,
    name: "coverage.estimatedCustomers",
  });
  const conflictPercent = useWatch({
    control,
    name: "coverage.conflictPercent",
  });
  const conflictHubName = useWatch({
    control,
    name: "coverage.conflictHubName",
  });
  const nearbyHubs = useWatch({ control, name: "coverage.nearbyHubs" });
  const nearbyHubLabel = useWatch({ control, name: "coverage.nearbyHubLabel" });
  const avgTransitMins = useWatch({ control, name: "coverage.avgTransitMins" });
  const peakDelayMins = useWatch({ control, name: "coverage.peakDelayMins" });
  const fuelEfficiency = useWatch({ control, name: "coverage.fuelEfficiency" });
  const polygonPoints =
    useWatch({ control, name: "coverage.polygonPoints" }) ?? [];

  useEffect(() => {
    const metrics = computeCoverageMetrics(radiusKm);
    setValue("coverage.estimatedCustomers", metrics.estimatedCustomers);
    setValue("coverage.conflictPercent", metrics.conflictPercent);
    setValue("coverage.avgTransitMins", metrics.avgTransitMins);
    setValue("coverage.peakDelayMins", metrics.peakDelayMins);
    setValue("basic.coverageRadiusKm", radiusKm);
    updateCoverage({
      radiusKm,
      ...metrics,
    });
    updateBasic({ coverageRadiusKm: radiusKm });
  }, [radiusKm, setValue, updateBasic, updateCoverage]);

  const polygonPath = polygonPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .concat("Z")
    .join(" ");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-primary text-xs font-semibold tracking-wider uppercase">
            Step 06/07
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#1A1A1A]">
            Service Area Coverage
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Define the geographic boundaries for your hub&apos;s delivery
            operations.
          </p>
        </div>
        <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
          <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Current Coverage
          </p>
          <p className="text-lg font-bold text-[#9A3412]">
            {radiusKm} KM Radius
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#1A1A1A]">
              Coverage Metrics
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500">Estimated Customers</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">
                  {estimatedCustomers?.toLocaleString("en-IN")}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (radiusKm / 50) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                <MapPinned className="text-primary size-4" />
                Nearby Hubs: {nearbyHubs} Active ({nearbyHubLabel})
              </div>
              {(conflictPercent ?? 0) > 0 ? (
                <div className="flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  {conflictPercent}% area conflict with {conflictHubName}.
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#1A1A1A]">
              Delivery ETA Statistics
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-500">Average Transit</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {avgTransitMins} mins
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Peak Hour Delay</span>
                <span className="font-semibold text-rose-600">
                  +{peakDelayMins} mins
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Fuel Efficiency</span>
                <span className="font-semibold text-emerald-600 capitalize">
                  {fuelEfficiency}
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-[#1A1A1A]">
              Radius Control
            </p>
            <input
              type="range"
              min={5}
              max={50}
              value={radiusKm}
              onChange={(event) =>
                setValue("coverage.radiusKm", Number(event.target.value), {
                  shouldValidate: true,
                })
              }
              className="accent-primary w-full"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {pincodes.map((pin) => (
                <span
                  key={pin}
                  className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-[#9A3412]"
                >
                  {pin}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-xl border border-gray-100 bg-[linear-gradient(145deg,#f8fafc_0%,#fff7ed_45%,#e2e8f0_100%)] shadow-sm">
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "polygon" ? "default" : "outline"}
              className="h-9 gap-2 bg-white"
              onClick={() => {
                setValue("coverage.mode", "polygon");
                updateCoverage({ mode: "polygon" });
              }}
            >
              <PenLine className="size-4" />
              Draw Polygon
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "pincode" ? "default" : "outline"}
              className="h-9 gap-2 bg-white"
              onClick={() => {
                setValue("coverage.mode", "pincode");
                updateCoverage({ mode: "pincode" });
              }}
            >
              <MapPinned className="size-4" />
              Select Pincodes
            </Button>
          </div>

          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
            <path
              d={polygonPath}
              fill="rgba(255,107,0,0.12)"
              stroke="#ff6b00"
              strokeWidth="0.8"
              strokeDasharray="2 1.5"
            />
            <circle cx="50" cy="50" r="2.2" fill="#9a3412" />
            <circle
              cx="50"
              cy="50"
              r={Math.min(35, radiusKm * 0.9)}
              fill="none"
              stroke="rgba(255,107,0,0.35)"
              strokeWidth="0.6"
            />
          </svg>

          <div className="absolute top-[46%] left-[42%] rounded-md bg-[#1A1A1A] px-2 py-1 text-[10px] font-semibold tracking-wider text-white uppercase shadow">
            Main Hub Center
          </div>
          <div className="absolute top-[58%] left-[55%] flex items-center gap-1 text-xs font-medium text-[#9A3412]">
            <MapPinned className="size-3.5" />
            DL-{pincodes[0] || "110001"}
          </div>

          <div className="absolute right-4 bottom-4 flex flex-col gap-2">
            {[Plus, Minus, Crosshair].map((Icon, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm",
                )}
                onClick={() => {
                  if (index === 0) {
                    setValue("coverage.radiusKm", Math.min(50, radiusKm + 1), {
                      shouldValidate: true,
                    });
                  } else if (index === 1) {
                    setValue("coverage.radiusKm", Math.max(5, radiusKm - 1), {
                      shouldValidate: true,
                    });
                  } else {
                    setValue("coverage.mode", "radius");
                    updateCoverage({ mode: "radius" });
                  }
                }}
              >
                <Icon className="size-4 text-gray-600" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
