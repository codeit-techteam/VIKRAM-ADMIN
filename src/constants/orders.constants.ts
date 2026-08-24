import type { OrderStatus } from "@/features/customer-executive/types";

/** Logistics statuses shown for orders actively moving to customers. */
export const ORDERS_IN_TRANSIT_LOGISTICS_STATUSES = [
  "ASSIGNED_HUB",
  "PACKED",
  "LOADED",
  "DISPATCHED",
  "OUT_FOR_DELIVERY",
  "IN_TRANSIT",
] as const;

export type OrdersInTransitLogisticsStatus =
  (typeof ORDERS_IN_TRANSIT_LOGISTICS_STATUSES)[number];

/** CE order statuses that map to dispatch / out-for-delivery progress. */
export const CE_ORDERS_IN_TRANSIT_STATUSES: OrderStatus[] = ["IN_TRANSIT"];

export const ORDERS_IN_TRANSIT_STATUS_GROUP = "IN_TRANSIT" as const;
