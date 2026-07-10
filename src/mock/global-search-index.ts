import { NAV_FILTER_PRESETS } from "@/constants/navigation-filters";
import { ROUTES } from "@/constants/routes";
import {
  CE_CUSTOMERS,
  CE_DRIVERS,
  CE_EXECUTIVES,
  CE_HUBS,
  CE_ORDERS,
  CE_VEHICLES,
} from "@/features/customer-executive/mock/seed";
import { SUB_HUBS } from "@/mock/sub-hubs";
import { TRANSFER_WAREHOUSE_OPTIONS } from "@/mock/transfers";
import { useLogisticsStore } from "@/store/logistics-store";

export type GlobalSearchEntityType =
  | "order"
  | "customer"
  | "warehouse"
  | "hub"
  | "driver"
  | "vehicle"
  | "executive"
  | "page";

export interface GlobalSearchResult {
  id: string;
  type: GlobalSearchEntityType;
  label: string;
  subtitle: string;
  href: string;
  keywords: string[];
}

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function matchesQuery(item: GlobalSearchResult, query: string): boolean {
  const q = normalize(query);
  if (!q) return false;

  return (
    normalize(item.label).includes(q) ||
    normalize(item.subtitle).includes(q) ||
    item.keywords.some((keyword) => normalize(keyword).includes(q))
  );
}

export function buildGlobalSearchIndex(): GlobalSearchResult[] {
  const orderResults: GlobalSearchResult[] = CE_ORDERS.map((order) => ({
    id: `order-${order.id}`,
    type: "order",
    label: `Order #${order.orderNumber}`,
    subtitle: `${order.customerName} · ${order.company}`,
    href: NAV_FILTER_PRESETS.orderDetail(order.id),
    keywords: [order.id, order.orderNumber, order.customerName, order.company],
  }));

  const customerResults: GlobalSearchResult[] = CE_CUSTOMERS.map(
    (customer) => ({
      id: `customer-${customer.id}`,
      type: "customer",
      label: customer.name,
      subtitle: `${customer.company} · ${customer.phone}`,
      href: NAV_FILTER_PRESETS.customerDetail(customer.id),
      keywords: [
        customer.id,
        customer.name,
        customer.company,
        customer.phone,
        customer.email,
        customer.city,
      ],
    }),
  );

  const warehouseResults: GlobalSearchResult[] = TRANSFER_WAREHOUSE_OPTIONS.map(
    (warehouse) => ({
      id: `warehouse-${warehouse.id}`,
      type: "warehouse",
      label: warehouse.label,
      subtitle: "Central Warehouse",
      href: `${ROUTES.CENTRAL_WAREHOUSE}/inventory?warehouse=${warehouse.id}`,
      keywords: [warehouse.id, warehouse.label, "warehouse"],
    }),
  );

  const hubResults: GlobalSearchResult[] = SUB_HUBS.map((hub) => ({
    id: `hub-${hub.id}`,
    type: "hub",
    label: hub.name,
    subtitle: `${hub.city} · ${hub.region}`,
    href: NAV_FILTER_PRESETS.hubDetail(hub.id),
    keywords: [hub.id, hub.name, hub.city, hub.region, hub.nodeId],
  }));

  const ceHubResults: GlobalSearchResult[] = CE_HUBS.map((hub) => ({
    id: `ce-hub-${hub.id}`,
    type: "hub",
    label: hub.name,
    subtitle: `${hub.city} Hub`,
    href: NAV_FILTER_PRESETS.hubDetail(hub.id),
    keywords: [hub.id, hub.name, hub.city],
  }));

  const driverResults: GlobalSearchResult[] = CE_DRIVERS.map((driver) => ({
    id: `driver-${driver.id}`,
    type: "driver",
    label: driver.name,
    subtitle: driver.phone,
    href: NAV_FILTER_PRESETS.driverDetail(driver.id),
    keywords: [driver.id, driver.name, driver.phone],
  }));

  const vehicleResults: GlobalSearchResult[] = CE_VEHICLES.map((vehicle) => ({
    id: `vehicle-${vehicle.id}`,
    type: "vehicle",
    label: vehicle.registration,
    subtitle: `${vehicle.model} · ${vehicle.payload}`,
    href: NAV_FILTER_PRESETS.vehicleDetail(vehicle.id),
    keywords: [vehicle.id, vehicle.registration, vehicle.model],
  }));

  const executiveResults: GlobalSearchResult[] = CE_EXECUTIVES.map(
    (executive) => ({
      id: `executive-${executive.id}`,
      type: "executive",
      label: executive.name,
      subtitle: executive.email,
      href: NAV_FILTER_PRESETS.executiveDetail(executive.id),
      keywords: [
        executive.id,
        executive.name,
        executive.email,
        executive.phone,
      ],
    }),
  );

  return [
    ...orderResults,
    ...customerResults,
    ...warehouseResults,
    ...hubResults,
    ...ceHubResults,
    ...driverResults,
    ...vehicleResults,
    ...executiveResults,
  ];
}

export function searchGlobalEntities(
  query: string,
  limit = 12,
): GlobalSearchResult[] {
  if (!query.trim()) return [];

  const index = buildGlobalSearchIndex();
  return index.filter((item) => matchesQuery(item, query)).slice(0, limit);
}

/** Enrich index with live logistics fleet data when store is available (client-only). */
export function searchGlobalEntitiesWithFleet(
  query: string,
  limit = 12,
): GlobalSearchResult[] {
  const base = searchGlobalEntities(query, limit);
  if (!query.trim()) return base;

  const q = normalize(query);
  const { drivers, vehicles } = useLogisticsStore.getState();

  const fleetDrivers: GlobalSearchResult[] = drivers
    .filter(
      (d) =>
        normalize(d.name).includes(q) ||
        normalize(d.employeeId).includes(q) ||
        normalize(d.mobile).includes(q),
    )
    .slice(0, 4)
    .map((driver) => ({
      id: `log-driver-${driver.id}`,
      type: "driver" as const,
      label: driver.name,
      subtitle: `${driver.employeeId} · Fleet`,
      href: NAV_FILTER_PRESETS.driverDetail(driver.id),
      keywords: [driver.id, driver.name, driver.employeeId],
    }));

  const fleetVehicles: GlobalSearchResult[] = vehicles
    .filter(
      (v) =>
        normalize(v.vehicleNumber).includes(q) ||
        normalize(v.vehicleType).includes(q),
    )
    .slice(0, 4)
    .map((vehicle) => ({
      id: `log-vehicle-${vehicle.id}`,
      type: "vehicle" as const,
      label: vehicle.vehicleNumber,
      subtitle: `${vehicle.vehicleType} · Fleet`,
      href: NAV_FILTER_PRESETS.vehicleDetail(vehicle.id),
      keywords: [vehicle.id, vehicle.vehicleNumber, vehicle.vehicleType],
    }));

  const merged = [...base, ...fleetDrivers, ...fleetVehicles];
  const seen = new Set<string>();

  return merged
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, limit);
}

export const GLOBAL_SEARCH_TYPE_LABELS: Record<GlobalSearchEntityType, string> =
  {
    order: "Orders",
    customer: "Customers",
    warehouse: "Warehouses",
    hub: "Hubs",
    driver: "Drivers",
    vehicle: "Vehicles",
    executive: "Executives",
    page: "Pages",
  };
