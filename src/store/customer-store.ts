import { create } from "zustand";

import {
  CUSTOMER_EXECUTIVES,
  CUSTOMER_HUBS,
  CUSTOMER_ORDERS_SEED,
  CUSTOMER_SEED,
  enrichCustomer,
  fetchCustomers,
  getCustomerDetail,
} from "@/mock/customer-service";
import type {
  CustomerDetail,
  CustomerFilters,
  CustomerOrder,
  CustomerQueryParams,
  CustomerQueryResult,
  CustomerRecord,
  CustomerStatus,
} from "@/features/user-management/types/customer.types";

interface CustomerStoreState {
  customers: CustomerRecord[];
  orders: CustomerOrder[];
  queryCustomers: (params: CustomerQueryParams) => CustomerQueryResult;
  getCustomer: (customerId: string) => CustomerDetail | null;
  updateCustomerStatus: (customerIds: string[], status: CustomerStatus) => void;
  assignHubToCustomers: (customerIds: string[], hubId: string) => void;
  exportSelectedCustomers: (customerIds: string[]) => CustomerDetail[];
}

export const useCustomerStore = create<CustomerStoreState>((set, get) => ({
  customers: [...CUSTOMER_SEED],
  orders: [...CUSTOMER_ORDERS_SEED],

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
    const { customers, orders } = get();
    return getCustomerDetail(
      customerId,
      customers,
      orders,
      CUSTOMER_HUBS,
      CUSTOMER_EXECUTIVES,
    );
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
    const { customers, orders } = get();

    return customerIds
      .map((customerId) =>
        getCustomerDetail(
          customerId,
          customers,
          orders,
          CUSTOMER_HUBS,
          CUSTOMER_EXECUTIVES,
        ),
      )
      .filter((customer): customer is CustomerDetail => customer !== null);
  },
}));

export function getEnrichedCustomerSnapshot(
  customer: CustomerRecord,
  orders: CustomerOrder[],
) {
  return enrichCustomer(customer, orders, CUSTOMER_HUBS, CUSTOMER_EXECUTIVES);
}

export type { CustomerFilters };
