export const VEHICLE_TYPE_OPTIONS = [
  "Mini Truck",
  "Pickup",
  "Tata Ace",
  "Bolero Pickup",
  "Eicher 14 FT",
  "Eicher 17 FT",
  "Ashok Leyland",
  "Container",
  "Trailer",
  "Hydra",
  "Crane",
] as const;

export const VEHICLE_CAPACITY_OPTIONS = [
  { label: "500 Kg", kg: 500 },
  { label: "1 Ton", kg: 1000 },
  { label: "2 Ton", kg: 2000 },
  { label: "5 Ton", kg: 5000 },
  { label: "10 Ton", kg: 10000 },
  { label: "20 Ton", kg: 20000 },
] as const;

export const FUEL_TYPE_OPTIONS = [
  "Diesel",
  "CNG",
  "Electric",
  "Petrol",
] as const;

export const MANUFACTURER_OPTIONS = [
  "Tata",
  "Ashok Leyland",
  "Mahindra",
  "Eicher",
  "Bharat Benz",
  "Force",
] as const;

export const PERMIT_TYPE_OPTIONS = [
  "State",
  "National Permit",
  "Local Permit",
] as const;

export const VEHICLE_STATUS_FORM_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "assigned", label: "Assigned" },
  { value: "maintenance", label: "Maintenance" },
  { value: "inactive", label: "Out of Service" },
] as const;

export const LICENSE_TYPE_OPTIONS = [
  "LMV",
  "HMV",
  "Transport",
  "Heavy Commercial",
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = [
  "Permanent",
  "Contract",
  "Third Party",
] as const;

export const DRIVER_STATUS_FORM_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "driving", label: "On Trip" },
  { value: "on_leave", label: "Leave" },
  { value: "inactive", label: "Inactive" },
] as const;

export const SHIFT_OPTIONS = ["Morning", "Evening", "Night"] as const;

export const BLOOD_GROUP_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

export const RELATIONSHIP_OPTIONS = [
  "Spouse",
  "Parent",
  "Sibling",
  "Friend",
  "Other",
] as const;

export const WAREHOUSE_HUB_MAP: Record<string, string[]> = {
  "Gurgaon Central Warehouse": [
    "South Delhi Hub",
    "Gurgaon Sector 14 Hub",
    "Ghaziabad Hub",
  ],
  "Noida Central Warehouse": ["Noida Sector 62 Hub", "Ghaziabad Hub"],
  "Faridabad Central Warehouse": ["Faridabad Hub", "Ghaziabad Hub"],
  "Mumbai Central Warehouse": ["Andheri Hub", "Thane Hub", "Navi Mumbai Hub"],
  "Bangalore Central Warehouse": [
    "Whitefield Hub",
    "Electronic City Hub",
    "Yelahanka Hub",
  ],
  "Kolkata Central Warehouse": ["Salt Lake Hub", "Howrah Hub", "New Town Hub"],
};

export const VEHICLE_FORM_STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Assignment" },
  { id: 3, label: "Compliance" },
  { id: 4, label: "Operations" },
] as const;

export const DRIVER_FORM_STEPS = [
  { id: 1, label: "Personal" },
  { id: 2, label: "License" },
  { id: 3, label: "Employment" },
  { id: 4, label: "Documents" },
  { id: 5, label: "Banking" },
  { id: 6, label: "Notes" },
] as const;
