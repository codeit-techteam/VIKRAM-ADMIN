export interface UnitOption {
  value: string;
  label: string;
}

// TODO: Replace with units API
export const MATERIAL_UNITS: UnitOption[] = [
  { value: "bags", label: "Bags" },
  { value: "pieces", label: "Pieces" },
  { value: "cft", label: "CFT" },
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
  return MATERIAL_UNITS.find((unit) => unit.value === value)?.label ?? value;
}
