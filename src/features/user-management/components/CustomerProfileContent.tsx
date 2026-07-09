"use client";

import {
  Ban,
  CheckCircle2,
  KeyRound,
  MapPin,
  Package,
  Pencil,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerActivityTimeline } from "@/features/user-management/components/CustomerActivityTimeline";
import { CustomerAddressCard } from "@/features/user-management/components/CustomerAddressCard";
import { CustomerConfirmationModal } from "@/features/user-management/components/CustomerConfirmationModal";
import { CustomerOrderDrawer } from "@/features/user-management/components/CustomerOrderDrawer";
import { CustomerOrderTable } from "@/features/user-management/components/CustomerOrderTable";
import { CustomerProfileCard } from "@/features/user-management/components/CustomerProfileCard";
import { CustomerSummaryCard } from "@/features/user-management/components/CustomerSummaryCard";
import { EditCustomerDrawer } from "@/features/user-management/components/EditCustomerDrawer";
import {
  CUSTOMER_BLOCK_REASON_LABELS,
  CUSTOMER_TYPE_LABELS,
  type CustomerBlockReason,
  type CustomerDeliveryAddress,
  type CustomerEditPayload,
} from "@/features/user-management/types/customer.types";
import { buildCustomerActivityTimeline } from "@/mock/customer-service";
import { ROUTES } from "@/constants/routes";
import { useCustomerStore } from "@/store/customer-store";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

interface CustomerProfileContentProps {
  customerId: string;
}

type ProfileTab = "orders" | "addresses" | "timeline";

const BLOCK_REASONS: CustomerBlockReason[] = [
  "VIOLATION",
  "DUPLICATE",
  "FRAUD",
  "MANUAL",
];

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-72" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Skeleton className="h-[640px] rounded-xl" />
        <Skeleton className="h-[640px] rounded-xl" />
      </div>
    </div>
  );
}

export function CustomerProfileContent({
  customerId,
}: CustomerProfileContentProps) {
  const getCustomer = useCustomerStore((state) => state.getCustomer);
  const getOrder = useCustomerStore((state) => state.getOrder);
  const customers = useCustomerStore((state) => state.customers);
  const orders = useCustomerStore((state) => state.orders);
  const addresses = useCustomerStore((state) => state.addresses);
  const updateCustomer = useCustomerStore((state) => state.updateCustomer);
  const blockCustomer = useCustomerStore((state) => state.blockCustomer);
  const unblockCustomer = useCustomerStore((state) => state.unblockCustomer);
  const resetPassword = useCustomerStore((state) => state.resetPassword);
  const updateDeliveryAddress = useCustomerStore(
    (state) => state.updateDeliveryAddress,
  );
  const deleteDeliveryAddress = useCustomerStore(
    (state) => state.deleteDeliveryAddress,
  );
  const setDefaultAddress = useCustomerStore(
    (state) => state.setDefaultAddress,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("orders");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [blockReason, setBlockReason] = useState<CustomerBlockReason>("MANUAL");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [editingAddress, setEditingAddress] =
    useState<CustomerDeliveryAddress | null>(null);
  const [viewingAddress, setViewingAddress] =
    useState<CustomerDeliveryAddress | null>(null);
  const [addressDraft, setAddressDraft] = useState({
    recipient: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, [customerId]);

  const customer = useMemo(
    () => getCustomer(customerId),
    [getCustomer, customerId, customers, orders, addresses],
  );

  const timeline = useMemo(
    () => (customer ? buildCustomerActivityTimeline(customer) : []),
    [customer],
  );

  const selectedOrder = useMemo(
    () => (selectedOrderId ? getOrder(selectedOrderId) : null),
    [getOrder, selectedOrderId, orders],
  );

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!customer) {
    return (
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "User Management", href: ROUTES.USER_MANAGEMENT },
            { label: "Customers", href: ROUTES.USER_MANAGEMENT_CUSTOMERS },
            { label: "Customer Profile" },
          ]}
        />
        <EmptyState
          title="Customer not found"
          description="The requested customer profile could not be located."
        />
      </div>
    );
  }

  const hasOrders = customer.orderSummary.totalOrders > 0;
  const isBlocked = customer.status === "BLOCKED";
  const primaryAddresses = customer.deliveryAddresses.filter(
    (address) => address.isDefault,
  );
  const otherAddresses = customer.deliveryAddresses.filter(
    (address) => !address.isDefault,
  );

  const handleSaveCustomer = (payload: CustomerEditPayload) => {
    updateCustomer(customer.id, payload);
    notify.success("Customer updated", "Profile changes saved successfully.");
  };

  const handleResetPassword = () => {
    const password = resetPassword(customer.id);
    setIsResetOpen(false);
    notify.success("Temporary password generated", `New password: ${password}`);
  };

  const handleBlockToggle = () => {
    if (isBlocked) {
      unblockCustomer(customer.id);
      setIsBlockOpen(false);
      notify.success("Customer unblocked", "Customer can place orders again.");
      return;
    }

    blockCustomer(customer.id, blockReason);
    setIsBlockOpen(false);
    notify.success(
      "Customer blocked",
      "Customer cannot place new orders. Existing completed orders remain visible.",
    );
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsOrderDrawerOpen(true);
  };

  const openAddressEditor = (address: CustomerDeliveryAddress) => {
    setEditingAddress(address);
    setAddressDraft({
      recipient: address.recipient,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
  };

  const handleSaveAddress = () => {
    if (!editingAddress) return;

    updateDeliveryAddress(customer.id, editingAddress.id, addressDraft);
    setEditingAddress(null);
    notify.success("Address updated", "Delivery address saved successfully.");
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "User Management", href: ROUTES.USER_MANAGEMENT },
          { label: "Customers", href: ROUTES.USER_MANAGEMENT_CUSTOMERS },
          { label: "Customer Profile" },
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A] sm:text-3xl">
              {customer.name}
            </h1>
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/5 text-primary rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider uppercase"
            >
              {CUSTOMER_TYPE_LABELS[customer.customerType]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Customer ID: {customer.customerId}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="size-4" />
            Edit Customer
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => setIsResetOpen(true)}
          >
            <KeyRound className="size-4" />
            Reset Password
          </Button>
          <Button
            type="button"
            variant={isBlocked ? "default" : "outline"}
            className={cn(
              "gap-2",
              !isBlocked &&
                "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700",
            )}
            onClick={() => setIsBlockOpen(true)}
          >
            {isBlocked ? (
              <>
                <CheckCircle2 className="size-4" />
                Unblock Customer
              </>
            ) : (
              <>
                <Ban className="size-4" />
                Block Customer
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <CustomerProfileCard
          customer={customer}
          className="xl:sticky xl:top-4 xl:self-start"
        />

        <div className="min-w-0 rounded-xl border border-gray-100 bg-white shadow-sm">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as ProfileTab)}
          >
            <div className="sticky top-0 z-10 rounded-t-xl border-b border-gray-100 bg-white/95 px-6 pt-4 backdrop-blur supports-backdrop-filter:bg-white/80">
              <TabsList
                variant="line"
                className="h-auto w-full justify-start gap-6 bg-transparent p-0"
              >
                <TabsTrigger
                  value="orders"
                  className="rounded-none px-0 pb-3 text-sm"
                >
                  Orders
                </TabsTrigger>
                <TabsTrigger
                  value="addresses"
                  className="rounded-none px-0 pb-3 text-sm"
                >
                  Delivery Addresses
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="rounded-none px-0 pb-3 text-sm"
                >
                  Activity Timeline
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="orders" className="mt-0 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <CustomerSummaryCard
                    label="Total Orders"
                    value={customer.orderSummary.totalOrders}
                    icon={Package}
                    iconContainerClassName="bg-blue-50"
                    iconClassName="text-blue-600"
                  />
                  <CustomerSummaryCard
                    label="Active Orders"
                    value={customer.orderSummary.activeOrders}
                    icon={ShoppingBag}
                    iconContainerClassName="bg-primary/10"
                    iconClassName="text-primary"
                  />
                  <CustomerSummaryCard
                    label="Delivered Orders"
                    value={customer.orderSummary.deliveredOrders}
                    icon={CheckCircle2}
                    iconContainerClassName="bg-emerald-50"
                    iconClassName="text-emerald-600"
                  />
                  <CustomerSummaryCard
                    label="Cancelled Orders"
                    value={customer.orderSummary.cancelledOrders}
                    icon={XCircle}
                    iconContainerClassName="bg-red-50"
                    iconClassName="text-red-600"
                  />
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-[#1A1A1A]">
                      Recent Orders
                    </h2>
                  </div>

                  {hasOrders ? (
                    <CustomerOrderTable
                      orders={customer.orders}
                      onViewOrder={handleViewOrder}
                    />
                  ) : (
                    <EmptyState
                      title="No Orders Yet"
                      description="This customer has not placed any orders. Hub and executive assignment will begin after the first order."
                      icon={<ShoppingBag className="size-10" />}
                      className="py-14"
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="addresses" className="mt-0 space-y-6">
                {customer.deliveryAddresses.length === 0 ? (
                  <EmptyState
                    title="No Saved Addresses"
                    description="This customer has not saved any delivery addresses yet."
                    icon={<MapPin className="size-10" />}
                    className="py-14"
                  />
                ) : (
                  <>
                    {primaryAddresses.length > 0 ? (
                      <section className="space-y-4">
                        <h2 className="text-sm font-semibold text-[#1A1A1A]">
                          Primary Address
                        </h2>
                        <div className="grid gap-4">
                          {primaryAddresses.map((address) => (
                            <CustomerAddressCard
                              key={address.id}
                              address={address}
                              onView={setViewingAddress}
                              onEdit={openAddressEditor}
                              onSetDefault={(addressId) => {
                                setDefaultAddress(customer.id, addressId);
                                notify.success(
                                  "Default address updated",
                                  "Primary delivery address changed.",
                                );
                              }}
                              onDelete={(addressId) => {
                                deleteDeliveryAddress(customer.id, addressId);
                                notify.success(
                                  "Address deleted",
                                  "Delivery address removed.",
                                );
                              }}
                            />
                          ))}
                        </div>
                      </section>
                    ) : null}

                    {otherAddresses.length > 0 ? (
                      <section className="space-y-4">
                        <h2 className="text-sm font-semibold text-[#1A1A1A]">
                          Other Addresses
                        </h2>
                        <div className="grid gap-4 lg:grid-cols-2">
                          {otherAddresses.map((address) => (
                            <CustomerAddressCard
                              key={address.id}
                              address={address}
                              onView={setViewingAddress}
                              onEdit={openAddressEditor}
                              onSetDefault={(addressId) => {
                                setDefaultAddress(customer.id, addressId);
                                notify.success(
                                  "Default address updated",
                                  "Primary delivery address changed.",
                                );
                              }}
                              onDelete={(addressId) => {
                                deleteDeliveryAddress(customer.id, addressId);
                                notify.success(
                                  "Address deleted",
                                  "Delivery address removed.",
                                );
                              }}
                            />
                          ))}
                        </div>
                      </section>
                    ) : null}
                  </>
                )}
              </TabsContent>

              <TabsContent value="timeline" className="mt-0">
                {timeline.length === 0 ? (
                  <EmptyState
                    title="No Activity Yet"
                    description="Customer activity will appear here as events occur."
                    className="py-14"
                  />
                ) : (
                  <CustomerActivityTimeline events={timeline} />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <EditCustomerDrawer
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        customer={customer}
        onSave={handleSaveCustomer}
      />

      <CustomerConfirmationModal
        open={isResetOpen}
        onOpenChange={setIsResetOpen}
        title="Reset Password?"
        description="A temporary password will be generated for this customer. Share it securely through your approved channel."
        confirmLabel="Generate Password"
        onConfirm={handleResetPassword}
      />

      <CustomerConfirmationModal
        open={isBlockOpen}
        onOpenChange={setIsBlockOpen}
        title={isBlocked ? "Unblock Customer?" : "Block Customer?"}
        description={
          isBlocked
            ? "This customer will be able to place new orders again."
            : "Blocked customers cannot place new orders. Existing completed orders remain visible."
        }
        confirmLabel={isBlocked ? "Unblock Customer" : "Block Customer"}
        confirmVariant={isBlocked ? "default" : "destructive"}
        onConfirm={handleBlockToggle}
      >
        {!isBlocked ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-[#1A1A1A]">Reason</p>
            <div className="grid gap-2">
              {BLOCK_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                    blockReason === reason
                      ? "border-primary bg-primary/5 text-[#1A1A1A]"
                      : "border-gray-100 text-[#64748B] hover:border-gray-200",
                  )}
                >
                  <input
                    type="radio"
                    name="block-reason"
                    value={reason}
                    checked={blockReason === reason}
                    onChange={() => setBlockReason(reason)}
                    className="accent-primary"
                  />
                  {CUSTOMER_BLOCK_REASON_LABELS[reason]}
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </CustomerConfirmationModal>

      <CustomerOrderDrawer
        open={isOrderDrawerOpen}
        onOpenChange={setIsOrderDrawerOpen}
        order={selectedOrder}
      />

      <CustomerConfirmationModal
        open={Boolean(viewingAddress)}
        onOpenChange={(open) => {
          if (!open) setViewingAddress(null);
        }}
        title="Delivery Address"
        description={viewingAddress?.recipient}
        confirmLabel="Close"
        onConfirm={() => setViewingAddress(null)}
      >
        {viewingAddress ? (
          <div className="space-y-2 text-sm text-[#64748B]">
            <p className="font-medium text-[#1A1A1A]">
              {viewingAddress.recipient}
            </p>
            <p>{viewingAddress.phone}</p>
            <p className="text-[#1A1A1A]">{viewingAddress.address}</p>
            <p>
              {viewingAddress.city}, {viewingAddress.state} —{" "}
              {viewingAddress.pincode}
            </p>
            <p>
              Service Hub:{" "}
              <span className="font-medium text-[#1A1A1A]">
                {viewingAddress.serviceHubName}
              </span>
            </p>
          </div>
        ) : null}
      </CustomerConfirmationModal>

      <CustomerConfirmationModal
        open={Boolean(editingAddress)}
        onOpenChange={(open) => {
          if (!open) setEditingAddress(null);
        }}
        title="Edit Delivery Address"
        confirmLabel="Save"
        onConfirm={handleSaveAddress}
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="addr-recipient">Recipient</Label>
            <Input
              id="addr-recipient"
              value={addressDraft.recipient}
              onChange={(event) =>
                setAddressDraft({
                  ...addressDraft,
                  recipient: event.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addr-phone">Phone</Label>
            <Input
              id="addr-phone"
              value={addressDraft.phone}
              onChange={(event) =>
                setAddressDraft({ ...addressDraft, phone: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addr-line">Address</Label>
            <Input
              id="addr-line"
              value={addressDraft.address}
              onChange={(event) =>
                setAddressDraft({
                  ...addressDraft,
                  address: event.target.value,
                })
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="addr-city">City</Label>
              <Input
                id="addr-city"
                value={addressDraft.city}
                onChange={(event) =>
                  setAddressDraft({
                    ...addressDraft,
                    city: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr-state">State</Label>
              <Input
                id="addr-state"
                value={addressDraft.state}
                onChange={(event) =>
                  setAddressDraft({
                    ...addressDraft,
                    state: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr-pincode">Pincode</Label>
              <Input
                id="addr-pincode"
                value={addressDraft.pincode}
                onChange={(event) =>
                  setAddressDraft({
                    ...addressDraft,
                    pincode: event.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </CustomerConfirmationModal>
    </div>
  );
}
