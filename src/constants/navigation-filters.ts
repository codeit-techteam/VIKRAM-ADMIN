import { ORDERS_IN_TRANSIT_STATUS_GROUP } from "@/constants/orders.constants";
import { ROUTES } from "@/constants/routes";
import { buildFilteredUrl } from "@/utils/navigation-filters";

export const NAV_FILTER_PRESETS = {
  ordersAll: () => ROUTES.ORDERS,

  ordersInTransit: () =>
    buildFilteredUrl(ROUTES.ORDERS, {
      statusGroup: ORDERS_IN_TRANSIT_STATUS_GROUP,
    }),

  ordersByStatus: (status: string) =>
    buildFilteredUrl(ROUTES.ORDERS, { status }),

  ordersByStatusGroup: (statusGroup: string) =>
    buildFilteredUrl(ROUTES.ORDERS, { statusGroup }),

  ordersBySource: (orderSource: string) =>
    buildFilteredUrl(ROUTES.CUSTOMER_EXECUTIVE_ORDERS, { orderSource }),

  orderDetail: (orderId: string) =>
    buildFilteredUrl(ROUTES.CUSTOMER_EXECUTIVE_ORDERS, { order: orderId }),

  paymentsPending: () =>
    buildFilteredUrl(ROUTES.CUSTOMER_EXECUTIVE_PAYMENTS, { status: "PENDING" }),

  paymentsByStatus: (status: string) =>
    buildFilteredUrl(ROUTES.CUSTOMER_EXECUTIVE_PAYMENTS, { status }),

  customersActive: () =>
    buildFilteredUrl(ROUTES.USER_MANAGEMENT_CUSTOMERS, { status: "ACTIVE" }),

  customersByStatus: (status: string) =>
    buildFilteredUrl(ROUTES.USER_MANAGEMENT_CUSTOMERS, { status }),

  customersKycPending: () =>
    buildFilteredUrl(ROUTES.USER_MANAGEMENT_CUSTOMERS, { kyc: "PENDING" }),

  executivesPending: () =>
    buildFilteredUrl(ROUTES.USER_MANAGEMENT_CUSTOMER_EXECUTIVES, {
      status: "PENDING",
    }),

  transfersWaitingHubAcceptance: () =>
    buildFilteredUrl(`${ROUTES.CENTRAL_WAREHOUSE}/transfers`, {
      status: "WAITING_HUB_ACCEPTANCE",
    }),

  transfersByStatus: (status: string) =>
    buildFilteredUrl(`${ROUTES.CENTRAL_WAREHOUSE}/transfers`, { status }),

  warehouseRequisitions: () =>
    buildFilteredUrl(`${ROUTES.CENTRAL_WAREHOUSE}/requisitions`, {
      status: "PENDING",
    }),

  hubRequisitions: () => ROUTES.HUB_REQUISITIONS,

  hubRequisitionsByStatus: (status: string) =>
    buildFilteredUrl(ROUTES.HUB_REQUISITIONS, { status }),

  hubTransfers: () => ROUTES.HUB_TRANSFERS,

  hubTransfersByStatus: (status: string) =>
    buildFilteredUrl(ROUTES.HUB_TRANSFERS, { status }),

  hubTransfersByHub: (hubId: string) =>
    buildFilteredUrl(ROUTES.HUB_TRANSFERS, { hub: hubId }),

  hubDispatchLogs: () => ROUTES.HUB_DISPATCH_LOGS,

  hubDispatchLogsByHub: (hubId: string) =>
    buildFilteredUrl(ROUTES.HUB_DISPATCH_LOGS, { hub: hubId }),

  customerDetail: (customerId: string) =>
    `${ROUTES.CUSTOMER_EXECUTIVE_CUSTOMERS}/${customerId}`,

  hubDetail: (hubId: string) => `${ROUTES.SUB_HUB_NETWORK}/${hubId}`,

  driverDetail: (driverId: string) =>
    buildFilteredUrl(`${ROUTES.LOGISTICS}/fleet/drivers`, { id: driverId }),

  vehicleDetail: (vehicleId: string) =>
    buildFilteredUrl(`${ROUTES.LOGISTICS}/fleet/vehicles`, { id: vehicleId }),

  executiveDetail: (executiveId: string) =>
    `${ROUTES.USER_MANAGEMENT_CUSTOMER_EXECUTIVES}/${executiveId}`,

  warehouseInventory: () => `${ROUTES.CENTRAL_WAREHOUSE}/inventory`,

  raiseOrder: () => ROUTES.CUSTOMER_EXECUTIVE_ORDERS_NEW,

  registerCustomer: () => ROUTES.CUSTOMER_EXECUTIVE_CUSTOMERS_NEW,
} as const;
