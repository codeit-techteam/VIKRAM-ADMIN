export interface MaterialCategory {
  id: string;
  label: string;
  subCategories: string[];
}

// TODO: Replace with categories API
export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  {
    id: "cement",
    label: "Cement",
    subCategories: [
      "OPC 53 Grade",
      "PPC 43 Grade",
      "White Cement",
      "Rapid Hardening",
    ],
  },
  {
    id: "steel",
    label: "Steel",
    subCategories: ["TMT Bars", "Structural Steel", "Steel Rebar", "Wire Rods"],
  },
  {
    id: "bricks",
    label: "Bricks",
    subCategories: [
      "Red Bricks",
      "Fly Ash Bricks",
      "AAC Blocks",
      "Hollow Blocks",
    ],
  },
  {
    id: "sand",
    label: "Sand",
    subCategories: ["River Sand", "M-Sand", "Plaster Sand", "Fill Sand"],
  },
  {
    id: "aggregates",
    label: "Aggregates",
    subCategories: [
      "20mm Aggregate",
      "10mm Aggregate",
      "Crushed Stone",
      "Gravel",
    ],
  },
  {
    id: "electrical",
    label: "Electrical",
    subCategories: ["Wiring", "Conduits", "Switches", "MCB & Distribution"],
  },
  {
    id: "paint",
    label: "Paint",
    subCategories: ["Emulsion", "Enamel", "Primer", "Exterior Coating"],
  },
  {
    id: "waterproofing",
    label: "Waterproofing",
    subCategories: [
      "Liquid Membrane",
      "Cementitious",
      "Bituminous",
      "Sheet Membrane",
    ],
  },
  {
    id: "adhesives",
    label: "Adhesives",
    subCategories: [
      "Tile Adhesive",
      "Construction Adhesive",
      "Epoxy",
      "Sealants",
    ],
  },
  {
    id: "quick-repair",
    label: "Quick Repair",
    subCategories: [
      "Patching Compound",
      "Crack Filler",
      "Floor Repair",
      "Structural Repair",
    ],
  },
  {
    id: "wall-putty",
    label: "Wall Putty",
    subCategories: [
      "Acrylic Putty",
      "White Cement Putty",
      "Exterior Putty",
      "Premium Putty",
    ],
  },
  {
    id: "tools",
    label: "Tools",
    subCategories: [
      "Hand Tools",
      "Power Tools",
      "Measuring Tools",
      "Safety Equipment",
    ],
  },
];

export function getCategoryLabel(id: string): string {
  return (
    MATERIAL_CATEGORIES.find((category) => category.id === id)?.label ?? id
  );
}

export function getSubCategories(categoryId: string): string[] {
  return (
    MATERIAL_CATEGORIES.find((category) => category.id === categoryId)
      ?.subCategories ?? []
  );
}
