import { create } from "zustand";

import {
  CUSTOMER_ADDRESSES_SEED,
  CUSTOMER_EXECUTIVES,
  CUSTOMER_HUBS,
  CUSTOMER_ORDERS_SEED,
  CUSTOMER_SEED,
  applyCustomerEdit,
  enrichCustomer,
  fetchCustomers,
  generateTemporaryPassword,
  getCustomerDetail,
  getNearestHub,
  getOrderDetail,
} from "@/mock/customer-service";
import {
  buildAllExecutives,
  getExecutiveProfile,
  queryExecutives,
} from "@/mock/customer-executive-service";
import {
  SUPPORT_EXECUTIVE_ASSIGNMENT_HISTORY_SEED,
  buildSupportExecutives,
  filterSupportExecutives,
  getCustomerAssignmentHistory,
  getExecutiveDashboardSummary,
  getSupportExecutiveById,
  syncCustomersWithAssignmentHistory,
} from "@/mock/support-executive-service";
import type { ExecutiveOnboardingSchema } from "@/features/user-management/schema/executive-onboarding.schema";
import type { CreateExecutiveResult } from "@/features/user-management/types/executive-onboarding.types";
import type {
  AssignSupportExecutivePayload,
  CustomerExecutiveRecord,
  RemoveSupportExecutivePayload,
  SupportExecutive,
  SupportExecutiveAssignmentHistoryEntry,
  SupportExecutiveFilters,
  ExecutiveProfileDetail,
  ExecutiveQueryParams,
  ExecutiveQueryResult,
} from "@/features/user-management/types/support-executive.types";
import {
  getCityById,
  getReportingHubById,
  getStateById,
} from "@/mock/executive-onboarding";
import type {
  CustomerBlockReason,
  CustomerDeliveryAddress,
  CustomerDetail,
  CustomerEditPayload,
  CustomerFilters,
  CustomerOrder,
  CustomerOrderDetail,
  CustomerQueryParams,
  CustomerQueryResult,
  CustomerRecord,
  CustomerStatus,
} from "@/features/user-management/types/customer.types";

interface CustomerStoreState {
  customers: CustomerRecord[];
  orders: CustomerOrder[];
  addresses: CustomerDeliveryAddress[];
  onboardedExecutives: CustomerExecutiveRecord[];
  supportExecutiveAssignmentHistory: SupportExecutiveAssignmentHistoryEntry[];
  queryCustomers: (params: CustomerQueryParams) => CustomerQueryResult;
  getCustomer: (customerId: string) => CustomerDetail | null;
  getOrder: (orderId: string) => CustomerOrderDetail | null;
  getSupportExecutives: (
    filters?: SupportExecutiveFilters,
  ) => SupportExecutive[];
  getAssignmentHistory: (
    customerId: string,
  ) => SupportExecutiveAssignmentHistoryEntry[];
  getExecutiveDashboard: () => ReturnType<typeof getExecutiveDashboardSummary>;
  assignSupportExecutive: (
    customerId: string,
    payload: AssignSupportExecutivePayload,
  ) => void;
  removeSupportExecutive: (
    customerId: string,
    payload: RemoveSupportExecutivePayload,
  ) => void;
  updateCustomer: (customerId: string, payload: CustomerEditPayload) => void;
  blockCustomer: (customerId: string, reason: CustomerBlockReason) => void;
  unblockCustomer: (customerId: string) => void;
  resetPassword: (customerId: string) => string;
  updateDeliveryAddress: (
    customerId: string,
    addressId: string,
    updates: Partial<CustomerDeliveryAddress>,
  ) => void;
  deleteDeliveryAddress: (customerId: string, addressId: string) => void;
  setDefaultAddress: (customerId: string, addressId: string) => void;
  updateCustomerStatus: (customerIds: string[], status: CustomerStatus) => void;
  assignHubToCustomers: (customerIds: string[], hubId: string) => void;
  exportSelectedCustomers: (customerIds: string[]) => CustomerDetail[];
  queryExecutives: (params: ExecutiveQueryParams) => ExecutiveQueryResult;
  getExecutiveProfile: (executiveId: string) => ExecutiveProfileDetail | null;
  createExecutiveFromDraft: (
    draft: ExecutiveOnboardingSchema,
  ) => CreateExecutiveResult;
}

export const useCustomerStore = create<CustomerStoreState>((set, get) => ({
  customers: syncCustomersWithAssignmentHistory(
    [...CUSTOMER_SEED],
    [...SUPPORT_EXECUTIVE_ASSIGNMENT_HISTORY_SEED],
  ),
  orders: [...CUSTOMER_ORDERS_SEED],
  addresses: [...CUSTOMER_ADDRESSES_SEED],
  onboardedExecutives: [],
  supportExecutiveAssignmentHistory: [
    ...SUPPORT_EXECUTIVE_ASSIGNMENT_HISTORY_SEED,
  ],

  queryCustomers: (params) => {
    const { customers, orders } = get();
    return fetchCustomers(
      customers,
      orders,
      params,
      CUSTOMER_HUBS,
      CUSTOMER_EXECUTIVES,
    );
  },

  getCustomer: (customerId) => {
    const { customers, orders, addresses } = get();
    return getCustomerDetail(
      customerId,
      customers,
      orders,
      addresses,
      CUSTOMER_HUBS,
      CUSTOMER_EXECUTIVES,
    );
  },

  getOrder: (orderId) => {
    const { customers, orders, addresses } = get();
    return getOrderDetail(
      orderId,
      orders,
      customers,
      addresses,
      CUSTOMER_HUBS,
      CUSTOMER_EXECUTIVES,
    );
  },

  getSupportExecutives: (filters) => {
    const { supportExecutiveAssignmentHistory } = get();
    const executives = buildSupportExecutives(
      supportExecutiveAssignmentHistory,
    );

    if (!filters) {
      return executives;
    }

    return filterSupportExecutives(executives, filters);
  },

  getAssignmentHistory: (customerId) => {
    const { supportExecutiveAssignmentHistory } = get();
    return getCustomerAssignmentHistory(
      customerId,
      supportExecutiveAssignmentHistory,
    );
  },

  getExecutiveDashboard: () => {
    const { supportExecutiveAssignmentHistory } = get();
    return getExecutiveDashboardSummary(supportExecutiveAssignmentHistory);
  },

  assignSupportExecutive: (customerId, payload) => {
    const executive = getSupportExecutiveById(
      payload.executiveId,
      get().supportExecutiveAssignmentHistory,
    );

    if (!executive) {
      return;
    }

    const now = new Date().toISOString();
    const assignedBy = payload.assignedBy ?? "Admin User";

    set((state) => {
      const previousCurrent = state.supportExecutiveAssignmentHistory.find(
        (entry) =>
          entry.customerId === customerId && entry.status === "CURRENT",
      );

      const updatedHistory = state.supportExecutiveAssignmentHistory.map(
        (entry) => {
          if (entry.customerId === customerId && entry.status === "CURRENT") {
            return {
              ...entry,
              status: "PREVIOUS" as const,
              removedDate: now,
              removedReason: previousCurrent
                ? "Executive changed."
                : entry.removedReason,
            };
          }

          return entry;
        },
      );

      const newHistoryEntry: SupportExecutiveAssignmentHistoryEntry = {
        id: `sea-hist-${customerId}-${Date.now()}`,
        customerId,
        executiveId: executive.id,
        executiveName: executive.name,
        employeeId: executive.employeeId,
        hubId: executive.hubId,
        hubName: executive.hubName,
        assignedBy,
        reason: payload.reason,
        priority: payload.priority,
        notes: payload.notes,
        assignedDate: now,
        status: "CURRENT",
      };

      const customers = state.customers.map((customer) => {
        if (customer.id !== customerId) {
          return customer;
        }

        return {
          ...customer,
          supportExecutiveAssignment: {
            executiveId: executive.id,
            executiveName: executive.name,
            employeeId: executive.employeeId,
            hubId: executive.hubId,
            hubName: executive.hubName,
            phone: executive.phone,
            email: executive.email,
            reason: payload.reason,
            priority: payload.priority,
            notes: payload.notes,
            assignedDate: now,
            assignedBy,
          },
          activity: {
            ...customer.activity,
            executiveAssignedAt: now,
          },
        };
      });

      return {
        customers,
        supportExecutiveAssignmentHistory: [...updatedHistory, newHistoryEntry],
      };
    });
  },

  removeSupportExecutive: (customerId, payload) => {
    const now = new Date().toISOString();
    const removedBy = payload.removedBy ?? "Admin User";

    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              supportExecutiveAssignment: undefined,
            }
          : customer,
      ),
      supportExecutiveAssignmentHistory:
        state.supportExecutiveAssignmentHistory.map((entry) =>
          entry.customerId === customerId && entry.status === "CURRENT"
            ? {
                ...entry,
                status: "PREVIOUS" as const,
                removedDate: now,
                removedReason: payload.reason,
                notes: entry.notes
                  ? `${entry.notes}\n\nRemoved by ${removedBy}.`
                  : `Removed by ${removedBy}.`,
              }
            : entry,
        ),
    }));
  },

  updateCustomer: (customerId, payload) => {
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === customerId
          ? applyCustomerEdit(customer, payload)
          : customer,
      ),
      addresses: state.addresses.map((address) =>
        address.customerId === customerId && address.isDefault
          ? {
              ...address,
              recipient: payload.name,
              phone: payload.phone,
              address: payload.address.primaryAddress,
              city: payload.address.city,
              state: payload.address.state,
              pincode: payload.address.pincode,
              serviceHubId: getNearestHub(
                payload.address.city,
                payload.address.state,
              ).id,
              serviceHubName: getNearestHub(
                payload.address.city,
                payload.address.state,
              ).name,
            }
          : address,
      ),
    }));
  },

  blockCustomer: (customerId, reason) => {
    const now = new Date().toISOString();

    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              status: "BLOCKED",
              blockReason: reason,
              blockedAt: now,
            }
          : customer,
      ),
    }));
  },

  unblockCustomer: (customerId) => {
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              status: "ACTIVE",
              blockReason: undefined,
              blockedAt: undefined,
            }
          : customer,
      ),
    }));
  },

  resetPassword: (customerId) => {
    const password = generateTemporaryPassword();
    void customerId;
    return password;
  },

  updateDeliveryAddress: (customerId, addressId, updates) => {
    set((state) => ({
      addresses: state.addresses.map((address) => {
        if (address.customerId !== customerId || address.id !== addressId) {
          return address;
        }

        const city = updates.city ?? address.city;
        const stateName = updates.state ?? address.state;
        const nearestHub = getNearestHub(city, stateName);

        return {
          ...address,
          ...updates,
          serviceHubId: nearestHub.id,
          serviceHubName: nearestHub.name,
        };
      }),
    }));
  },

  deleteDeliveryAddress: (customerId, addressId) => {
    set((state) => {
      const remaining = state.addresses.filter(
        (address) =>
          !(address.customerId === customerId && address.id === addressId),
      );
      const hadDefault = state.addresses.some(
        (address) =>
          address.customerId === customerId &&
          address.id === addressId &&
          address.isDefault,
      );

      if (!hadDefault) {
        return { addresses: remaining };
      }

      const nextDefault = remaining.find(
        (address) => address.customerId === customerId,
      );

      if (!nextDefault) {
        return { addresses: remaining };
      }

      return {
        addresses: remaining.map((address) =>
          address.id === nextDefault.id
            ? { ...address, isDefault: true }
            : address,
        ),
      };
    });
  },

  setDefaultAddress: (customerId, addressId) => {
    set((state) => ({
      addresses: state.addresses.map((address) => {
        if (address.customerId !== customerId) {
          return address;
        }

        return {
          ...address,
          isDefault: address.id === addressId,
        };
      }),
    }));
  },

  updateCustomerStatus: (customerIds, status) => {
    set((state) => ({
      customers: state.customers.map((customer) =>
        customerIds.includes(customer.id) ? { ...customer, status } : customer,
      ),
    }));
  },

  assignHubToCustomers: (customerIds, hubId) => {
    const hub = CUSTOMER_HUBS.find((entry) => entry.id === hubId);

    if (!hub) {
      return;
    }

    const now = new Date().toISOString();

    set((state) => {
      const newOrders: CustomerOrder[] = [];

      const customers = state.customers.map((customer) => {
        if (!customerIds.includes(customer.id)) {
          return customer;
        }

        const hasOrders = state.orders.some(
          (order) => order.customerId === customer.id,
        );

        if (hasOrders) {
          return customer;
        }

        newOrders.push({
          id: `ord-assign-${customer.id}-${Date.now()}`,
          orderId: `ORD-ASGN-${customer.customerId.slice(-5)}`,
          customerId: customer.id,
          date: now,
          hubId: hub.id,
          status: "PENDING",
          amount: 1,
          orderSource: "CUSTOMER_APP",
        });

        return {
          ...customer,
          activity: {
            ...customer.activity,
            firstOrderAt: now,
            latestOrderAt: now,
            executiveAssignedAt: now,
          },
        };
      });

      return {
        customers,
        orders: [...state.orders, ...newOrders],
      };
    });
  },

  exportSelectedCustomers: (customerIds) => {
    const { customers, orders, addresses } = get();

    return customerIds
      .map((customerId) =>
        getCustomerDetail(
          customerId,
          customers,
          orders,
          addresses,
          CUSTOMER_HUBS,
          CUSTOMER_EXECUTIVES,
        ),
      )
      .filter((customer): customer is CustomerDetail => customer !== null);
  },

  queryExecutives: (params) => {
    const {
      customers,
      orders,
      supportExecutiveAssignmentHistory,
      onboardedExecutives,
    } = get();
    const executives = [
      ...buildAllExecutives(
        orders,
        supportExecutiveAssignmentHistory,
        customers,
      ),
      ...onboardedExecutives,
    ];
    return queryExecutives(executives, orders, params);
  },

  getExecutiveProfile: (executiveId) => {
    const {
      customers,
      orders,
      supportExecutiveAssignmentHistory,
      onboardedExecutives,
    } = get();
    const executives = [
      ...buildAllExecutives(
        orders,
        supportExecutiveAssignmentHistory,
        customers,
      ),
      ...onboardedExecutives,
    ];
    return getExecutiveProfile(
      executiveId,
      executives,
      orders,
      customers,
      supportExecutiveAssignmentHistory,
    );
  },

  createExecutiveFromDraft: (draft) => {
    const reportingHub = getReportingHubById(draft.reportingHub);
    const stateData = getStateById(draft.state);
    const cityData = getCityById(draft.city);
    const primaryHubName =
      draft.assignedHubNames[0] ?? reportingHub?.name ?? "Unassigned";
    const newId = `exec-new-${Date.now()}`;

    const newExecutive: CustomerExecutiveRecord = {
      id: newId,
      employeeId: draft.employeeId,
      name: draft.fullName,
      photo: draft.profilePhoto ?? undefined,
      phone: `+91 ${draft.phone}`,
      email: draft.email,
      hubId: draft.assignedHubs[0] ?? draft.reportingHub,
      hub: primaryHubName,
      region: reportingHub?.region ?? stateData?.name ?? "Unassigned",
      assignedCustomers: 0,
      todayOrders: 0,
      totalOrders: 0,
      todayCalls: 0,
      status: draft.accountActive ? "AVAILABLE" : "OFFLINE",
      joiningDate: draft.joiningDate || new Date().toISOString(),
    };

    set((state) => ({
      onboardedExecutives: [...state.onboardedExecutives, newExecutive],
    }));

    return {
      id: newId,
      employeeId: draft.employeeId,
      name: draft.fullName,
      hubName: primaryHubName,
      region: `${stateData?.name ?? ""} (${cityData?.name ?? ""})`.trim(),
      username: draft.username,
      credentialsSent: draft.sendWelcomeEmail || draft.sendSms,
    };
  },
}));

export function getEnrichedCustomerSnapshot(
  customer: CustomerRecord,
  orders: CustomerOrder[],
) {
  return enrichCustomer(customer, orders, CUSTOMER_HUBS, CUSTOMER_EXECUTIVES);
}

export type { CustomerFilters };
