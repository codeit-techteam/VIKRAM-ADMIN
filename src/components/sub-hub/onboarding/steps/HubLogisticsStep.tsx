"use client";

import {
  CalendarClock,
  Pencil,
  Plus,
  Trash2,
  Truck,
  UserPlus,
} from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DELIVERY_SLOT_OPTIONS } from "@/mock/hub-onboarding";
import type { HubFormSchema } from "@/schema/hub-form.schema";
import { useHubDraftStore } from "@/store/hub-draft-store";
import type { DeliverySlot } from "@/types/hub-onboarding.types";
import { cn } from "@/lib/utils";
import { notify } from "@/utils/notify";

export function HubLogisticsStep() {
  const { control, setValue } = useFormContext<HubFormSchema>();
  const updateFleet = useHubDraftStore((s) => s.updateFleet);
  const drivers = useWatch({ control, name: "fleet.drivers" }) ?? [];
  const vehicles = useWatch({ control, name: "fleet.vehicles" }) ?? [];
  const deliverySlots =
    useWatch({ control, name: "fleet.deliverySlots" }) ?? [];

  const toggleSlot = (slot: DeliverySlot) => {
    const next = deliverySlots.includes(slot)
      ? deliverySlots.filter((item) => item !== slot)
      : [...deliverySlots, slot];
    setValue("fleet.deliverySlots", next, { shouldValidate: true });
    updateFleet({ deliverySlots: next });
  };

  const addDriver = () => {
    const next = [
      ...drivers,
      {
        id: `drv-draft-${Date.now()}`,
        name: "New Driver",
        phone: "+91 90000 00000",
        licenseNo: "TEMP-LICENSE",
        avatarInitials: "ND",
      },
    ];
    setValue("fleet.drivers", next, { shouldValidate: true });
    updateFleet({ drivers: next });
    notify.success("Driver added", "Assign details before publishing.");
  };

  const addVehicle = () => {
    const next = [
      ...vehicles,
      {
        id: `veh-draft-${Date.now()}`,
        vehicleType: "6-Ton LCV",
        regNumber: "TEMP-REG",
        status: "active" as const,
      },
    ];
    setValue("fleet.vehicles", next, { shouldValidate: true });
    updateFleet({ vehicles: next });
    notify.success("Vehicle added", "Update registration before publishing.");
  };

  const progress = Math.min(
    100,
    Math.round(
      ((drivers.length > 0 ? 1 : 0) +
        (vehicles.length > 0 ? 1 : 0) +
        (deliverySlots.length > 0 ? 1 : 0) +
        4) *
        (100 / 7),
    ),
  );

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Fleet & Driver Setup
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Assign delivery resources and define operating windows for dispatch
            planning.
          </p>
        </div>

        <FormSectionCard
          icon={UserPlus}
          title="Assign Drivers"
          headerAction={
            <Button
              type="button"
              variant="outline"
              className="border-primary text-primary h-9 gap-2"
              onClick={addDriver}
            >
              <Plus className="size-4" />
              Add Driver
            </Button>
          }
        >
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs tracking-wider text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Driver Name</th>
                  <th className="px-4 py-3">License No.</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver, index) => (
                  <tr key={driver.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full text-xs font-semibold">
                          {driver.avatarInitials}
                        </span>
                        <div>
                          <Input
                            className="h-8 w-44"
                            value={driver.name}
                            onChange={(event) => {
                              const next = drivers.map((item, idx) =>
                                idx === index
                                  ? { ...item, name: event.target.value }
                                  : item,
                              );
                              setValue("fleet.drivers", next);
                              updateFleet({ drivers: next });
                            }}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            {driver.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        className="h-8 w-44"
                        value={driver.licenseNo}
                        onChange={(event) => {
                          const next = drivers.map((item, idx) =>
                            idx === index
                              ? { ...item, licenseNo: event.target.value }
                              : item,
                          );
                          setValue("fleet.drivers", next);
                          updateFleet({ drivers: next });
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon-sm">
                          <Pencil className="size-4 text-gray-400" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            const next = drivers.filter(
                              (_, idx) => idx !== index,
                            );
                            setValue("fleet.drivers", next, {
                              shouldValidate: true,
                            });
                            updateFleet({ drivers: next });
                          }}
                        >
                          <Trash2 className="size-4 text-gray-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FormSectionCard>

        <FormSectionCard
          icon={Truck}
          title="Assign Vehicles"
          headerAction={
            <Button
              type="button"
              variant="outline"
              className="border-primary text-primary h-9 gap-2"
              onClick={addVehicle}
            >
              <Plus className="size-4" />
              Add Vehicle
            </Button>
          }
        >
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs tracking-wider text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Vehicle Type</th>
                  <th className="px-4 py-3">Reg Number</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle, index) => (
                  <tr key={vehicle.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Truck className="text-primary size-4" />
                        <Input
                          className="h-8 w-48"
                          value={vehicle.vehicleType}
                          onChange={(event) => {
                            const next = vehicles.map((item, idx) =>
                              idx === index
                                ? { ...item, vehicleType: event.target.value }
                                : item,
                            );
                            setValue("fleet.vehicles", next);
                            updateFleet({ vehicles: next });
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        className="h-8 w-40"
                        value={vehicle.regNumber}
                        onChange={(event) => {
                          const next = vehicles.map((item, idx) =>
                            idx === index
                              ? { ...item, regNumber: event.target.value }
                              : item,
                          );
                          setValue("fleet.vehicles", next);
                          updateFleet({ vehicles: next });
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 uppercase">
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          const next = vehicles.filter(
                            (_, idx) => idx !== index,
                          );
                          setValue("fleet.vehicles", next, {
                            shouldValidate: true,
                          });
                          updateFleet({ vehicles: next });
                        }}
                      >
                        <Trash2 className="size-4 text-gray-400" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FormSectionCard>

        <FormSectionCard icon={CalendarClock} title="Delivery Logic">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {DELIVERY_SLOT_OPTIONS.map((slot) => {
              const active = deliverySlots.includes(slot.value);
              return (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => toggleSlot(slot.value)}
                  className={cn(
                    "rounded-xl border px-4 py-4 text-left transition-colors",
                    active
                      ? "border-primary bg-orange-50"
                      : "border-gray-200 bg-white hover:border-gray-300",
                  )}
                >
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {slot.label}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{slot.hint}</p>
                </button>
              );
            })}
          </div>
        </FormSectionCard>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#1A1A1A]">Hub Summary</p>
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#9A3412] uppercase">
              Draft
            </span>
          </div>
          <p className="text-xs text-gray-500">Setup Progress</p>
          <p className="mt-1 text-2xl font-bold text-[#1A1A1A]">{progress}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li className="flex justify-between">
              <span>Vehicles Assigned</span>
              <span className="font-semibold text-[#1A1A1A]">
                {vehicles.length}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Drivers Assigned</span>
              <span className="font-semibold text-[#1A1A1A]">
                {drivers.length}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Active Shifts</span>
              <span className="font-semibold text-[#1A1A1A]">
                {deliverySlots.length}
              </span>
            </li>
          </ul>
          <div className="mt-4 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-800">
            Logistics data helps in real-time tracking during the actual
            delivery cycles.
          </div>
        </div>
      </aside>
    </div>
  );
}
