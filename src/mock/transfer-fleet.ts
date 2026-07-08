import type { FleetDriver, FleetVehicle } from "@/types/warehouse.types";

export const FLEET_VEHICLES: FleetVehicle[] = [
  {
    id: "veh-001",
    vehicleNumber: "HR-55-AN-1024",
    vehicleType: "10-Ton Trailer",
    capacityKg: 10_000,
    location: "Warehouse Zone A",
    availability: "now",
    status: "idle",
  },
  {
    id: "veh-002",
    vehicleNumber: "DL-01-AB-4421",
    vehicleType: "8-Ton Truck",
    capacityKg: 8_000,
    location: "Loading Bay 3",
    availability: "now",
    status: "idle",
  },
  {
    id: "veh-003",
    vehicleNumber: "HR-26-BK-7783",
    vehicleType: "12-Ton Flatbed",
    capacityKg: 12_000,
    location: "Yard North",
    availability: "2hr",
    status: "idle",
  },
  {
    id: "veh-004",
    vehicleNumber: "UP-16-CD-3309",
    vehicleType: "6-Ton LCV",
    capacityKg: 6_000,
    location: "Service Bay",
    availability: "4hr",
    status: "maintenance",
  },
  {
    id: "veh-005",
    vehicleNumber: "HR-12-EF-5512",
    vehicleType: "15-Ton Trailer",
    capacityKg: 15_000,
    location: "Warehouse Zone B",
    availability: "now",
    status: "idle",
  },
  {
    id: "veh-006",
    vehicleNumber: "DL-09-GH-2290",
    vehicleType: "10-Ton Trailer",
    capacityKg: 10_000,
    location: "Gate 2",
    availability: "2hr",
    status: "idle",
  },
  {
    id: "veh-007",
    vehicleNumber: "HR-55-AZ-4412",
    vehicleType: "TATA Prima 2525.K",
    capacityKg: 15_500,
    location: "Fleet Depot",
    availability: "now",
    status: "idle",
  },
  {
    id: "veh-008",
    vehicleNumber: "UP-32-JK-8891",
    vehicleType: "8-Ton Truck",
    capacityKg: 8_500,
    location: "Warehouse Zone C",
    availability: "now",
    status: "assigned",
  },
  {
    id: "veh-009",
    vehicleNumber: "HR-10-LM-3345",
    vehicleType: "12-Ton Flatbed",
    capacityKg: 12_000,
    location: "Outbound Lane",
    availability: "4hr",
    status: "in-transit",
  },
  {
    id: "veh-010",
    vehicleNumber: "DL-05-NP-6677",
    vehicleType: "6-Ton LCV",
    capacityKg: 6_500,
    location: "Maintenance",
    availability: "4hr",
    status: "maintenance",
  },
  {
    id: "veh-011",
    vehicleNumber: "HR-18-QR-1122",
    vehicleType: "10-Ton Trailer",
    capacityKg: 10_000,
    location: "Warehouse Zone A",
    availability: "now",
    status: "idle",
  },
  {
    id: "veh-012",
    vehicleNumber: "UP-14-ST-5566",
    vehicleType: "15-Ton Trailer",
    capacityKg: 15_000,
    location: "Yard South",
    availability: "2hr",
    status: "idle",
  },
];

export const FLEET_DRIVERS: FleetDriver[] = [
  {
    id: "drv-001",
    name: "Rajesh Kumar",
    employeeId: "EMP-882",
    licenseType: "Heavy Duty",
    experienceYears: 8,
    rating: 4.8,
    status: "ready",
    phone: "+91 98765 43210",
    avatarInitials: "RK",
  },
  {
    id: "drv-002",
    name: "Suresh Kumar Yadav",
    employeeId: "EMP-745",
    licenseType: "Heavy Duty",
    experienceYears: 10,
    rating: 4.9,
    status: "ready",
    phone: "+91 98123 45678",
    avatarInitials: "SY",
  },
  {
    id: "drv-003",
    name: "Amit Singh",
    employeeId: "EMP-1042",
    licenseType: "Medium Duty",
    experienceYears: 5,
    rating: 4.5,
    status: "on-duty",
    phone: "+91 99001 22334",
    avatarInitials: "AS",
  },
  {
    id: "drv-004",
    name: "Vikram Sharma",
    employeeId: "EMP-1156",
    licenseType: "Heavy Duty",
    experienceYears: 12,
    rating: 4.7,
    status: "ready",
    phone: "+91 98700 11223",
    avatarInitials: "VS",
  },
  {
    id: "drv-005",
    name: "Deepak Gupta",
    employeeId: "EMP-1204",
    licenseType: "Medium Duty",
    experienceYears: 4,
    rating: 4.3,
    status: "leave",
    phone: "+91 98111 33445",
    avatarInitials: "DG",
  },
  {
    id: "drv-006",
    name: "Rohan Mehta",
    employeeId: "EMP-938",
    licenseType: "Heavy Duty",
    experienceYears: 6,
    rating: 4.6,
    status: "ready",
    phone: "+91 98222 55667",
    avatarInitials: "RM",
  },
  {
    id: "drv-007",
    name: "Suresh Patel",
    employeeId: "EMP-773",
    licenseType: "Light Duty",
    experienceYears: 3,
    rating: 4.2,
    status: "on-duty",
    phone: "+91 98333 77889",
    avatarInitials: "SP",
  },
  {
    id: "drv-008",
    name: "Manoj Tiwari",
    employeeId: "EMP-654",
    licenseType: "Heavy Duty",
    experienceYears: 9,
    rating: 4.8,
    status: "assigned",
    phone: "+91 98444 99001",
    avatarInitials: "MT",
  },
];

export function getAvailableVehicles(
  vehicles = FLEET_VEHICLES,
): FleetVehicle[] {
  return vehicles.filter(
    (vehicle) => vehicle.status === "idle" && vehicle.availability !== "4hr",
  );
}

export function getAvailableDrivers(drivers = FLEET_DRIVERS): FleetDriver[] {
  return drivers.filter((driver) => driver.status === "ready");
}

export function assignVehicle(
  vehicleId: string,
  vehicles = FLEET_VEHICLES,
): FleetVehicle[] {
  return vehicles.map((vehicle) =>
    vehicle.id === vehicleId
      ? { ...vehicle, status: "assigned" as const }
      : vehicle,
  );
}

export function assignDriver(
  driverId: string,
  drivers = FLEET_DRIVERS,
): FleetDriver[] {
  return drivers.map((driver) =>
    driver.id === driverId
      ? { ...driver, status: "assigned" as const }
      : driver,
  );
}

export function formatAvailability(
  availability: FleetVehicle["availability"],
): string {
  switch (availability) {
    case "now":
      return "Available Now";
    case "2hr":
      return "2 Hr Out";
    case "4hr":
      return "4 Hr Out";
    default:
      return availability;
  }
}

export function formatDriverStatus(status: FleetDriver["status"]): string {
  switch (status) {
    case "ready":
      return "Ready";
    case "assigned":
      return "Assigned";
    case "on-duty":
      return "On-Duty";
    case "leave":
      return "Leave";
  }
}

export function formatVehicleStatus(status: FleetVehicle["status"]): string {
  switch (status) {
    case "idle":
      return "IDLE";
    case "assigned":
      return "ASSIGNED";
    case "maintenance":
      return "MAINTENANCE";
    case "in-transit":
      return "IN TRANSIT";
  }
}
