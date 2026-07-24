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
import { useCallback, useEffect, useMemo, useState } from "react";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  DELIVERY_SITE_TYPE_LABELS,
  type CustomerBlockReason,
  type CustomerEditPayload,
  type DeliverySite,
  type DeliverySiteType,
  type UpdateDeliverySitePayload,
} from "@/features/user-management/types/customer.types";
import { buildCustomerActivityTimeline } from "@/mock/customer-service";
import { ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/services/api";
import {
  deleteCustomerSite,
  fetchCustomerSites,
  setPrimaryCustomerSite,
  updateCustomerSite,
} from "@/services/customers";
import { useCustomerStore } from "@/store/customer-store";
import { formatDate } from "@/utils/format-date";
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

const SITE_TYPE_OPTIONS = Object.keys(
  DELIVERY_SITE_TYPE_LABELS,
) as DeliverySiteType[];

const EMPTY_SITE_DRAFT: UpdateDeliverySitePayload = {
  siteName: "",
  siteType: "CONSTRUCTION_SITE",
  contactPerson: "",
  phone: "",
  fullAddress: "",
  landmark: "",
  gateNumber: "",
  floor: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  latitude: 0,
  longitude: 0,
  deliveryNotes: "",
  isPrimary: false,
};

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

function SitesSkeleton() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
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
  const supportExecutiveAssignmentHistory = useCustomerStore(
    (state) => state.supportExecutiveAssignmentHistory,
  );
  const updateCustomer = useCustomerStore((state) => state.updateCustomer);
  const blockCustomer = useCustomerStore((state) => state.blockCustomer);
  const unblockCustomer = useCustomerStore((state) => state.unblockCustomer);
  const resetPassword = useCustomerStore((state) => state.resetPassword);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("orders");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [blockReason, setBlockReason] = useState<CustomerBlockReason>("MANUAL");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);

  const [sites, setSites] = useState<DeliverySite[]>([]);
  const [isSitesLoading, setIsSitesLoading] = useState(true);
  const [isSiteActionPending, setIsSiteActionPending] = useState(false);
  const [editingSite, setEditingSite] = useState<DeliverySite | null>(null);
  const [viewingSite, setViewingSite] = useState<DeliverySite | null>(null);
  const [siteDraft, setSiteDraft] =
    useState<UpdateDeliverySitePayload>(EMPTY_SITE_DRAFT);

  const loadSites = useCallback(async () => {
    setIsSitesLoading(true);
    try {
      const data = await fetchCustomerSites(customerId);
      setSites(data);
    } catch (error) {
      setSites([]);
      notify.error("Failed to load delivery sites", getApiErrorMessage(error));
    } finally {
      setIsSitesLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, [customerId]);

  useEffect(() => {
    void loadSites();
  }, [loadSites]);

  const customer = useMemo(
    () => getCustomer(customerId),
    [
      getCustomer,
      customerId,
      customers,
      orders,
      addresses,
      supportExecutiveAssignmentHistory,
    ],
  );

  const timeline = useMemo(
    () => (customer ? buildCustomerActivityTimeline(customer) : []),
    [customer],
  );

  const selectedOrder = useMemo(
    () => (selectedOrderId ? getOrder(selectedOrderId) : null),
    [getOrder, selectedOrderId, orders],
  );

  const primarySites = useMemo(
    () => sites.filter((site) => site.isPrimary),
    [sites],
  );
  const otherSites = useMemo(
    () => sites.filter((site) => !site.isPrimary),
    [sites],
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

  const openSiteEditor = (site: DeliverySite) => {
    setEditingSite(site);
    setSiteDraft({
      siteName: site.siteName,
      siteType: site.siteType ?? "CONSTRUCTION_SITE",
      contactPerson: site.contactPerson ?? "",
      phone: site.phone ?? "",
      fullAddress: site.fullAddress,
      landmark: site.landmark ?? "",
      gateNumber: site.gateNumber ?? "",
      floor: site.floor ?? "",
      city: site.city,
      state: site.state,
      country: site.country || "India",
      pincode: site.pincode,
      latitude: site.latitude,
      longitude: site.longitude,
      deliveryNotes: site.deliveryNotes ?? "",
      isPrimary: site.isPrimary,
    });
  };

  const handleSaveSite = async () => {
    if (!editingSite) return;

    setIsSiteActionPending(true);
    try {
      await updateCustomerSite(customerId, editingSite.id, {
        siteName: siteDraft.siteName?.trim() || editingSite.siteName,
        siteType: siteDraft.siteType,
        contactPerson: siteDraft.contactPerson?.trim() || undefined,
        phone: siteDraft.phone?.trim() || undefined,
        fullAddress: siteDraft.fullAddress?.trim() || editingSite.fullAddress,
        landmark: siteDraft.landmark?.trim() || undefined,
        gateNumber: siteDraft.gateNumber?.trim() || undefined,
        floor: siteDraft.floor?.trim() || undefined,
        city: siteDraft.city?.trim() || editingSite.city,
        state: siteDraft.state?.trim() || editingSite.state,
        country: siteDraft.country?.trim() || undefined,
        pincode: siteDraft.pincode?.trim() || editingSite.pincode,
        latitude: Number(siteDraft.latitude ?? editingSite.latitude),
        longitude: Number(siteDraft.longitude ?? editingSite.longitude),
        deliveryNotes: siteDraft.deliveryNotes?.trim() || undefined,
        isPrimary: siteDraft.isPrimary,
      });
      setEditingSite(null);
      notify.success("Site updated", "Delivery site saved successfully.");
      await loadSites();
    } catch (error) {
      notify.error("Failed to update site", getApiErrorMessage(error));
    } finally {
      setIsSiteActionPending(false);
    }
  };

  const handleSetPrimarySite = async (siteId: string) => {
    setIsSiteActionPending(true);
    try {
      await setPrimaryCustomerSite(customerId, siteId);
      notify.success("Primary site updated", "Primary delivery site changed.");
      await loadSites();
    } catch (error) {
      notify.error("Failed to set primary site", getApiErrorMessage(error));
    } finally {
      setIsSiteActionPending(false);
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    setIsSiteActionPending(true);
    try {
      await deleteCustomerSite(customerId, siteId);
      notify.success("Site deleted", "Delivery site removed.");
      await loadSites();
    } catch (error) {
      notify.error("Failed to delete site", getApiErrorMessage(error));
    } finally {
      setIsSiteActionPending(false);
    }
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
                {isSitesLoading ? (
                  <SitesSkeleton />
                ) : sites.length === 0 ? (
                  <EmptyState
                    title="No Saved Addresses"
                    description="This customer has not saved any delivery sites yet."
                    icon={<MapPin className="size-10" />}
                    className="py-14"
                  />
                ) : (
                  <>
                    {primarySites.length > 0 ? (
                      <section className="space-y-4">
                        <h2 className="text-sm font-semibold text-[#1A1A1A]">
                          Primary Address
                        </h2>
                        <div className="grid gap-4">
                          {primarySites.map((site) => (
                            <CustomerAddressCard
                              key={site.id}
                              site={site}
                              onView={setViewingSite}
                              onEdit={openSiteEditor}
                              onSetPrimary={(siteId) => {
                                void handleSetPrimarySite(siteId);
                              }}
                              onDelete={(siteId) => {
                                void handleDeleteSite(siteId);
                              }}
                            />
                          ))}
                        </div>
                      </section>
                    ) : null}

                    {otherSites.length > 0 ? (
                      <section className="space-y-4">
                        <h2 className="text-sm font-semibold text-[#1A1A1A]">
                          Other Addresses
                        </h2>
                        <div className="grid gap-4 lg:grid-cols-2">
                          {otherSites.map((site) => (
                            <CustomerAddressCard
                              key={site.id}
                              site={site}
                              onView={setViewingSite}
                              onEdit={openSiteEditor}
                              onSetPrimary={(siteId) => {
                                void handleSetPrimarySite(siteId);
                              }}
                              onDelete={(siteId) => {
                                void handleDeleteSite(siteId);
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
        open={Boolean(viewingSite)}
        onOpenChange={(open) => {
          if (!open) setViewingSite(null);
        }}
        title="Delivery Site"
        description={viewingSite?.siteName}
        confirmLabel="Close"
        onConfirm={() => setViewingSite(null)}
      >
        {viewingSite ? (
          <div className="space-y-2 text-sm text-[#64748B]">
            <p className="font-medium text-[#1A1A1A]">{viewingSite.siteName}</p>
            {viewingSite.siteType ? (
              <p>{DELIVERY_SITE_TYPE_LABELS[viewingSite.siteType]}</p>
            ) : null}
            {viewingSite.contactPerson ? (
              <p>Contact: {viewingSite.contactPerson}</p>
            ) : null}
            {viewingSite.phone ? <p>{viewingSite.phone}</p> : null}
            <p className="text-[#1A1A1A]">{viewingSite.fullAddress}</p>
            {viewingSite.landmark ? (
              <p>Landmark: {viewingSite.landmark}</p>
            ) : null}
            {(viewingSite.gateNumber || viewingSite.floor) && (
              <p>
                {[viewingSite.gateNumber, viewingSite.floor]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            <p>
              {viewingSite.city}, {viewingSite.state}
              {viewingSite.pincode ? ` — ${viewingSite.pincode}` : ""}
            </p>
            <p>
              Coords:{" "}
              <span className="font-medium text-[#1A1A1A]">
                {viewingSite.latitude.toFixed(4)},{" "}
                {viewingSite.longitude.toFixed(4)}
              </span>
            </p>
            {viewingSite.deliveryNotes ? (
              <p>Notes: {viewingSite.deliveryNotes}</p>
            ) : null}
            <p>
              Created:{" "}
              <span className="font-medium text-[#1A1A1A]">
                {formatDate(viewingSite.createdAt)}
              </span>
            </p>
            {typeof viewingSite.ordersDelivered === "number" ? (
              <p>
                Orders delivered:{" "}
                <span className="font-medium text-[#1A1A1A]">
                  {viewingSite.ordersDelivered}
                </span>
              </p>
            ) : null}
            {viewingSite.isPrimary ? (
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                Primary
              </Badge>
            ) : null}
          </div>
        ) : null}
      </CustomerConfirmationModal>

      <CustomerConfirmationModal
        open={Boolean(editingSite)}
        onOpenChange={(open) => {
          if (!open && !isSiteActionPending) setEditingSite(null);
        }}
        title="Edit Delivery Site"
        confirmLabel="Save"
        isSubmitting={isSiteActionPending}
        onConfirm={() => {
          void handleSaveSite();
        }}
      >
        <div className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input
              id="site-name"
              value={siteDraft.siteName ?? ""}
              onChange={(event) =>
                setSiteDraft({ ...siteDraft, siteName: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Site Type</Label>
            <Select
              value={siteDraft.siteType}
              onValueChange={(value) => {
                if (!value) return;
                setSiteDraft({
                  ...siteDraft,
                  siteType: value as DeliverySiteType,
                });
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Select site type" />
              </SelectTrigger>
              <SelectContent>
                {SITE_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {DELIVERY_SITE_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="site-contact">Contact Person</Label>
              <Input
                id="site-contact"
                value={siteDraft.contactPerson ?? ""}
                onChange={(event) =>
                  setSiteDraft({
                    ...siteDraft,
                    contactPerson: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-phone">Phone</Label>
              <Input
                id="site-phone"
                value={siteDraft.phone ?? ""}
                onChange={(event) =>
                  setSiteDraft({ ...siteDraft, phone: event.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-address">Full Address</Label>
            <Input
              id="site-address"
              value={siteDraft.fullAddress ?? ""}
              onChange={(event) =>
                setSiteDraft({
                  ...siteDraft,
                  fullAddress: event.target.value,
                })
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="site-landmark">Landmark</Label>
              <Input
                id="site-landmark"
                value={siteDraft.landmark ?? ""}
                onChange={(event) =>
                  setSiteDraft({ ...siteDraft, landmark: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-gate">Gate Number</Label>
              <Input
                id="site-gate"
                value={siteDraft.gateNumber ?? ""}
                onChange={(event) =>
                  setSiteDraft({
                    ...siteDraft,
                    gateNumber: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-floor">Floor</Label>
              <Input
                id="site-floor"
                value={siteDraft.floor ?? ""}
                onChange={(event) =>
                  setSiteDraft({ ...siteDraft, floor: event.target.value })
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="site-city">City</Label>
              <Input
                id="site-city"
                value={siteDraft.city ?? ""}
                onChange={(event) =>
                  setSiteDraft({ ...siteDraft, city: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-state">State</Label>
              <Input
                id="site-state"
                value={siteDraft.state ?? ""}
                onChange={(event) =>
                  setSiteDraft({ ...siteDraft, state: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-pincode">Pincode</Label>
              <Input
                id="site-pincode"
                value={siteDraft.pincode ?? ""}
                onChange={(event) =>
                  setSiteDraft({ ...siteDraft, pincode: event.target.value })
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="site-lat">Latitude</Label>
              <Input
                id="site-lat"
                type="number"
                step="any"
                value={siteDraft.latitude ?? 0}
                onChange={(event) =>
                  setSiteDraft({
                    ...siteDraft,
                    latitude: Number(event.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-lng">Longitude</Label>
              <Input
                id="site-lng"
                type="number"
                step="any"
                value={siteDraft.longitude ?? 0}
                onChange={(event) =>
                  setSiteDraft({
                    ...siteDraft,
                    longitude: Number(event.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-notes">Delivery Notes</Label>
            <Textarea
              id="site-notes"
              value={siteDraft.deliveryNotes ?? ""}
              onChange={(event) =>
                setSiteDraft({
                  ...siteDraft,
                  deliveryNotes: event.target.value,
                })
              }
            />
          </div>
        </div>
      </CustomerConfirmationModal>
    </div>
  );
}
