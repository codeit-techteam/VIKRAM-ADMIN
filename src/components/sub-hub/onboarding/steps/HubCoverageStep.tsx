"use client";

import {
  AlertTriangle,
  Crosshair,
  MapPinned,
  Minus,
  PenLine,
  Plus,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { computeCoverageMetrics } from "@/mock/hub-onboarding";
import type { HubFormSchema } from "@/schema/hub-form.schema";
import { useHubDraftStore } from "@/store/hub-draft-store";
import { cn } from "@/lib/utils";

const HubCoverageMap = dynamic(
  () =>
    import("@/components/sub-hub/onboarding/HubCoverageMap").then(
      (mod) => mod.HubCoverageMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex size-full items-center justify-center bg-slate-100 text-sm text-gray-500">
        Loading map…
      </div>
    ),
  },
);

export function HubCoverageStep() {
  const { control, setValue } = useFormContext<HubFormSchema>();
  const updateCoverage = useHubDraftStore((s) => s.updateCoverage);
  const updateBasic = useHubDraftStore((s) => s.updateBasic);

  const radiusKm = useWatch({ control, name: "coverage.radiusKm" }) ?? 15;
  const mode = useWatch({ control, name: "coverage.mode" });
  const pincodes = useWatch({ control, name: "coverage.pincodes" }) ?? [];
  const latitude = useWatch({ control, name: "coverage.latitude" }) ?? 28.6139;
  const longitude = useWatch({ control, name: "coverage.longitude" }) ?? 77.209;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-primary text-xs font-semibold tracking-wider uppercase">
            Step 05/06
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#1A1A1A]">
            Service Area Coverage
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Define the geographic boundaries for your hub&apos;s delivery
            operations. Customers within this radius are auto-assigned here.
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
            <p className="mt-3 text-xs text-gray-500">
              Center: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-xl border border-gray-100 bg-slate-100 shadow-sm">
          <div className="absolute top-4 left-4 z-[500] flex flex-wrap gap-2">
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

          <HubCoverageMap
            latitude={latitude}
            longitude={longitude}
            radiusKm={radiusKm}
          />

          <div className="absolute top-4 right-4 z-[500] rounded-md bg-[#1A1A1A] px-2 py-1 text-[10px] font-semibold tracking-wider text-white uppercase shadow">
            Hub Marker · {radiusKm} KM
          </div>

          <div className="absolute right-4 bottom-4 z-[500] flex flex-col gap-2">
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
