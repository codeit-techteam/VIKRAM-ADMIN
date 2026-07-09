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
  queryCustomers: (params: CustomerQueryParams) => CustomerQueryResult;
  getCustomer: (customerId: string) => CustomerDetail | null;
  getOrder: (orderId: string) => CustomerOrderDetail | null;
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
}

export const useCustomerStore = create<CustomerStoreState>((set, get) => ({
  customers: [...CUSTOMER_SEED],
  orders: [...CUSTOMER_ORDERS_SEED],
  addresses: [...CUSTOMER_ADDRESSES_SEED],

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
}));

export function getEnrichedCustomerSnapshot(
  customer: CustomerRecord,
  orders: CustomerOrder[],
) {
  return enrichCustomer(customer, orders, CUSTOMER_HUBS, CUSTOMER_EXECUTIVES);
}

export type { CustomerFilters };
