export interface UnitOption {
  value: string;
  label: string;
}

// TODO: Replace with units API
export const MATERIAL_UNITS: UnitOption[] = [
  { value: "bags", label: "Bags" },
  { value: "pieces", label: "Pieces" },
  { value: "cft", label: "CFT" },
  { value: "cubic_meter", label: "Cubic Meter" },
  { value: "cum", label: "Cum" },
  { value: "kg", label: "kg" },
  { value: "ton", label: "Ton" },
  { value: "roll", label: "Roll" },
  { value: "litre", label: "Litre" },
  { value: "meter", label: "Meter" },
  { value: "nos", label: "Nos" },
  { value: "box", label: "Box" },
  { value: "bundle", label: "Bundle" },
  { value: "drum", label: "Drum" },
];

export function getUnitLabel(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (
    normalized === "cum" ||
    normalized === "cubic_meter" ||
    normalized === "cubic meter" ||
    normalized === "cubic metres" ||
    normalized === "cubic metre" ||
    normalized === "cubic meters"
  ) {
    return "Cubic Meter";
  }
  return MATERIAL_UNITS.find((unit) => unit.value === value)?.label ?? value;
}
