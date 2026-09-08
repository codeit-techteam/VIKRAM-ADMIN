"use client";

import { Minus, Plus, Search, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/routes";
import { CeCustomerAvatar } from "@/features/customer-executive/components/shared/CeCustomerAvatar";
import { CePageShell } from "@/features/customer-executive/components/shared/CePageShell";
import { calculateOrderTotal } from "@/features/customer-executive/utils/order-totals";
import type {
  CeOrderItem,
  DeliveryPriority,
  PaymentMethod,
} from "@/features/customer-executive/types";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import { formatCurrency } from "@/utils/format-currency";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  desc?: string;
}[] = [
  { value: "CASH", label: "Cash on Delivery" },
  { value: "UPI", label: "Payment link", desc: "UPI / Bank transfer" },
];

const PRIORITY_OPTIONS: DeliveryPriority[] = [
  "STANDARD",
  "EXPRESS",
  "EMERGENCY",
];

export function CeNewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get("customer");

  const products = useCustomerExecutiveStore((s) => s.products);
  const customers = useCustomerExecutiveStore((s) => s.customers);
  const loadProducts = useCustomerExecutiveStore((s) => s.loadProducts);
  const loadCustomerById = useCustomerExecutiveStore((s) => s.loadCustomerById);
  const lookupCustomer = useCustomerExecutiveStore((s) => s.lookupCustomer);
  const productsLoading = useCustomerExecutiveStore((s) => s.productsLoading);
  const productsError = useCustomerExecutiveStore((s) => s.productsError);
  const createOrder = useCustomerExecutiveStore((s) => s.createOrder);
  const currentExecutive = useCustomerExecutiveStore((s) => s.currentExecutive);

  const [phoneSearch, setPhoneSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    preselectedCustomerId ?? "",
  );
  const [productSearch, setProductSearch] = useState("");
  const [items, setItems] = useState<CeOrderItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryPriority, setDeliveryPriority] =
    useState<DeliveryPriority>("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts(productSearch);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [loadProducts, productSearch]);

  useEffect(() => {
    if (preselectedCustomerId) {
      void loadCustomerById(preselectedCustomerId);
    }
  }, [preselectedCustomerId, loadCustomerById]);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const s = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s),
    );
  }, [products, productSearch]);

  const totals = useMemo(() => calculateOrderTotal(items), [items]);

  useEffect(() => {
    if (selectedCustomer) {
      setDeliveryAddress(selectedCustomer.address);
      setDeliveryPincode(selectedCustomer.pincode);
      setPhoneSearch(selectedCustomer.phone);
    }
  }, [selectedCustomer]);

  const handleSearchCustomer = async () => {
    const phone = phoneSearch.trim();
    if (!phone) {
      notify.error("Enter a phone number", "Search by customer mobile number");
      return;
    }

    try {
      const result = await lookupCustomer(phone);
      if (!result.exists) {
        notify.error("Customer not found", "Try registering a new customer");
        return;
      }
      if (result.assignedToOtherExecutive) {
        notify.error(
          "Customer assigned elsewhere",
          "This customer is assigned to another executive",
        );
        return;
      }

      const customerId = result.customer?.id;
      if (!customerId) {
        notify.error("Customer not found", "Try registering a new customer");
        return;
      }

      // Lookup returns a slim payload — load full profile for the order form.
      const fullCustomer = await loadCustomerById(customerId);
      if (!fullCustomer) {
        notify.error("Customer not found", "Try registering a new customer");
        return;
      }

      setSelectedCustomerId(fullCustomer.id);
      setDeliveryAddress(fullCustomer.address);
      setDeliveryPincode(fullCustomer.pincode);
      setPhoneSearch(fullCustomer.phone);
      notify.success("Customer found", fullCustomer.name);
    } catch (error) {
      notify.error(
        "Search failed",
        error instanceof Error ? error.message : "Try again",
      );
    }
  };

  const addProduct = (productId: string, variantId?: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const variant =
      product.variants?.find((item) => item.id === variantId) ??
      product.variants?.[0];
    const lineKey = `${product.id}:${variant?.id ?? "default"}`;
    const existing = items.find(
      (i) => `${i.productId}:${i.variantId ?? "default"}` === lineKey,
    );
    if (existing) {
      setItems(
        items.map((i) =>
          `${i.productId}:${i.variantId ?? "default"}` === lineKey
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        ),
      );
      return;
    }
    setItems([
      ...items,
      {
        productId: product.id,
        variantId: variant?.id,
        productName: variant
          ? `${product.name} (${variant.label})`
          : product.name,
        sku: variant?.sku ?? product.sku,
        unit: variant?.unit ?? product.unit,
        unitPrice: variant?.unitPrice ?? product.unitPrice,
        quantity: 1,
      },
    ]);
  };

  const lineKey = (item: CeOrderItem) =>
    `${item.productId}:${item.variantId ?? "default"}`;

  const updateQuantity = (key: string, delta: number) => {
    setItems(
      items
        .map((i) =>
          lineKey(i) === key
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const removeItem = (key: string) => {
    setItems(items.filter((i) => lineKey(i) !== key));
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      notify.error("Select a customer first");
      return;
    }
    if (items.length === 0) {
      notify.error("Add at least one product");
      return;
    }
    if (!deliveryAddress.trim()) {
      notify.error("Enter delivery address");
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createOrder({
        customerId: selectedCustomerId,
        items,
        deliveryAddress,
        deliveryPincode,
        deliveryDate: deliveryDate || new Date().toISOString(),
        deliveryPriority,
        paymentMethod,
      });
      notify.success("Order submitted", `Order #${order.orderNumber} created`);
      router.push(`${ROUTES.CUSTOMER_EXECUTIVE}/orders`);
    } catch (error) {
      notify.error(
        "Order creation failed",
        error instanceof Error ? error.message : "Try again",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CePageShell
      breadcrumbs={[
        { label: "Customer Executive", href: ROUTES.CUSTOMER_EXECUTIVE },
        { label: "Orders", href: `${ROUTES.CUSTOMER_EXECUTIVE}/orders` },
        { label: "Create New" },
      ]}
      title="New Order"
      subtitle="Place an order on behalf of a B2B customer."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Customer Search</CardTitle>
              <Link
                href={`${ROUTES.CUSTOMER_EXECUTIVE}/customers/new`}
                className="text-primary text-sm hover:underline"
              >
                + New Caller? Quick Register
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  placeholder="Enter customer phone number"
                  className="flex-1"
                />
                <Button variant="outline" onClick={() => setPhoneSearch("")}>
                  Clear
                </Button>
                <Button onClick={handleSearchCustomer}>
                  <Search className="size-4" />
                  Search
                </Button>
              </div>

              {selectedCustomer && (
                <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50/30 p-4">
                  <div className="flex items-center gap-3">
                    <CeCustomerAvatar
                      name={selectedCustomer.name}
                      id={selectedCustomer.id}
                      size="lg"
                    />
                    <div>
                      <p className="font-semibold">{selectedCustomer.name}</p>
                      <p className="text-sm text-[#64748B]">
                        {selectedCustomer.company}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        Lifetime:{" "}
                        {formatCurrency(selectedCustomer.lifetimePurchase)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCustomerId("")}
                  >
                    Switch Customer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search SKU or product name..."
              />

              {items.length > 0 && (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}:${item.variantId ?? "default"}`}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                    >
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-[#64748B]">
                          {item.sku} • {formatCurrency(item.unitPrice)}/
                          {item.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() =>
                            updateQuantity(
                              `${item.productId}:${item.variantId ?? "default"}`,
                              -1,
                            )
                          }
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() =>
                            updateQuantity(
                              `${item.productId}:${item.variantId ?? "default"}`,
                              1,
                            )
                          }
                        >
                          <Plus className="size-3" />
                        </Button>
                        <span className="w-24 text-right font-medium">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            removeItem(
                              `${item.productId}:${item.variantId ?? "default"}`,
                            )
                          }
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {productsError ? (
                <p className="text-sm text-red-600">{productsError}</p>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2">
                {productsLoading ? (
                  <p className="text-sm text-[#64748B]">Loading products…</p>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-sm text-[#64748B]">No products found</p>
                ) : (
                  filteredProducts.slice(0, 8).map((product) => (
                    <div
                      key={product.id}
                      className="rounded-lg border border-gray-100 p-3"
                    >
                      <p className="text-sm font-medium">{product.name}</p>
                      { (product.variants ?? []).length > 1 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(product.variants ?? []).map((variant) => (
                            <button
                              key={variant.id}
                              type="button"
                              onClick={() => addProduct(product.id, variant.id)}
                              className="hover:border-primary/40 rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-orange-50/50"
                            >
                              {variant.label} · {formatCurrency(variant.unitPrice)}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            addProduct(product.id, product.variants?.[0]?.id)
                          }
                          className="mt-2 flex w-full items-center justify-between text-left"
                        >
                          <span className="text-xs text-[#64748B]">
                            {formatCurrency(product.unitPrice)}/{product.unit}
                          </span>
                          <Plus className="text-primary size-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Delivery Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Delivery Address</Label>
                  <Textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input
                    value={deliveryPincode}
                    onChange={(e) => setDeliveryPincode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Date</Label>
                  <Input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>
                <div className="flex gap-1 rounded-lg border border-gray-200 p-1">
                  {PRIORITY_OPTIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDeliveryPriority(p)}
                      className={cn(
                        "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                        deliveryPriority === p
                          ? "bg-primary text-white"
                          : "text-[#64748B] hover:bg-gray-50",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {PAYMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPaymentMethod(opt.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                      paymentMethod === opt.value
                        ? "border-primary bg-orange-50/50"
                        : "border-gray-100 hover:border-gray-200",
                    )}
                  >
                    <span className="font-medium">{opt.label}</span>
                    {opt.desc && (
                      <span className="text-xs text-[#64748B]">{opt.desc}</span>
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">GST (18%)</span>
                <span>{formatCurrency(totals.gst)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Delivery Fee</span>
                <span className="text-blue-600">FREE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Loyalty Discount</span>
                <span className="text-primary">
                  -{formatCurrency(totals.loyaltyDiscount)}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Grand Total</span>
                  <span className="text-xl font-bold">
                    {formatCurrency(totals.grandTotal)}
                  </span>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                Submit Order on Behalf
              </Button>
              <p className="text-center text-xs text-[#64748B]">
                By submitting, you confirm verbal authorization from the
                customer.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <Truck className="text-primary size-4" />
                Fulfillment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Assigned hub</p>
                <p className="text-sm font-medium">
                  {selectedCustomer?.assignedHubName ||
                    currentExecutive?.assignedHubName ||
                    "Assigned at order confirmation"}
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Hub assignment and delivery ETA are calculated by the backend
                when the order is placed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </CePageShell>
  );
}
