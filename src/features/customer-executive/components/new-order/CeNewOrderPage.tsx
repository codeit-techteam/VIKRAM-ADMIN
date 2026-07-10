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
import { CeStatusBadge } from "@/features/customer-executive/components/shared/CeStatusBadge";
import { calculateOrderTotal } from "@/features/customer-executive/mock/queries";
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
  { value: "UPI", label: "UPI" },
  { value: "BANK", label: "Bank Transfer" },
  { value: "CASH", label: "Cash" },
  { value: "CREDIT", label: "Credit", desc: "Limit: ₹5L" },
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
  const getCustomerByPhone = useCustomerExecutiveStore(
    (s) => s.getCustomerByPhone,
  );
  const createOrder = useCustomerExecutiveStore((s) => s.createOrder);

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CREDIT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  useEffect(() => {
    if (preselectedCustomerId && selectedCustomer) {
      setDeliveryAddress(selectedCustomer.address);
      setDeliveryPincode(selectedCustomer.pincode);
      setPhoneSearch(selectedCustomer.phone);
    }
  }, [preselectedCustomerId, selectedCustomer]);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const s = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s),
    );
  }, [products, productSearch]);

  const totals = useMemo(() => calculateOrderTotal(items), [items]);

  const handleSearchCustomer = () => {
    const found = getCustomerByPhone(phoneSearch);
    if (found) {
      setSelectedCustomerId(found.id);
      setDeliveryAddress(found.address);
      setDeliveryPincode(found.pincode);
      notify.success("Customer found", found.name);
    } else {
      notify.error("Customer not found", "Try registering a new customer");
    }
  };

  const addProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const existing = items.find((i) => i.productId === productId);
    if (existing) {
      setItems(
        items.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unit: product.unit,
          unitPrice: product.unitPrice,
          quantity: 1,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems(
      items
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const handleSubmit = () => {
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
      const order = createOrder({
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
                      key={item.productId}
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
                          onClick={() => updateQuantity(item.productId, -1)}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => updateQuantity(item.productId, 1)}
                        >
                          <Plus className="size-3" />
                        </Button>
                        <span className="w-24 text-right font-medium">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                {filteredProducts.slice(0, 4).map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProduct(product.id)}
                    className="hover:border-primary/30 flex items-center justify-between rounded-lg border border-gray-100 p-3 text-left transition-colors hover:bg-orange-50/30"
                  >
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-[#64748B]">
                        {formatCurrency(product.unitPrice)}/{product.unit}
                      </p>
                    </div>
                    <Plus className="text-primary size-4" />
                  </button>
                ))}
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
                Operational Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Nearest Hub</p>
                <p className="text-sm font-medium">
                  Gurgaon Sector 42 (Active — 3.2km)
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <CeStatusBadge status="PENDING" label="Payment" />
                <CeStatusBadge status="IN_TRANSIT" label="Inventory" />
                <CeStatusBadge status="DELIVERED" label="Logistics" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Est. delivery time</p>
                <div className="mt-1 h-2 rounded-full bg-gray-700">
                  <div className="bg-primary h-2 w-3/4 rounded-full" />
                </div>
                <p className="text-primary mt-1 text-sm">~180 mins</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CePageShell>
  );
}
