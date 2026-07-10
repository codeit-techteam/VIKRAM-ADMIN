"use client";

import {
  CreditCard,
  Eye,
  MessageSquareWarning,
  Package,
  Phone,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { CeCustomerAvatar } from "@/features/customer-executive/components/shared/CeCustomerAvatar";
import { CePageShell } from "@/features/customer-executive/components/shared/CePageShell";
import { CeStatusBadge } from "@/features/customer-executive/components/shared/CeStatusBadge";
import { CeTimeline } from "@/features/customer-executive/components/shared/CeTimeline";
import { CeConfirmationDialog } from "@/features/customer-executive/components/shared/CeConfirmationDialog";
import { useCeLoading } from "@/features/customer-executive/hooks/use-ce-loading";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import { formatCurrency } from "@/utils/format-currency";
import { notify } from "@/utils/notify";
import {
  initiateCall,
  openWhatsApp,
} from "@/features/customer-executive/utils/communication";
import { notFound } from "next/navigation";

interface CeCustomerProfilePageProps {
  customerId: string;
}

export function CeCustomerProfilePage({
  customerId,
}: CeCustomerProfilePageProps) {
  const router = useRouter();
  const { isLoading } = useCeLoading(customerId);
  const getCustomer = useCustomerExecutiveStore((s) => s.getCustomer);
  const getCustomerOrders = useCustomerExecutiveStore(
    (s) => s.getCustomerOrders,
  );
  const getCustomerPayments = useCustomerExecutiveStore(
    (s) => s.getCustomerPayments,
  );
  const getCustomerComplaints = useCustomerExecutiveStore(
    (s) => s.getCustomerComplaints,
  );
  const getCustomerNotes = useCustomerExecutiveStore((s) => s.getCustomerNotes);
  const getCustomerActivities = useCustomerExecutiveStore(
    (s) => s.getCustomerActivities,
  );
  const getCustomerOrderStats = useCustomerExecutiveStore(
    (s) => s.getCustomerOrderStats,
  );
  const executives = useCustomerExecutiveStore((s) => s.executives);
  const addNote = useCustomerExecutiveStore((s) => s.addNote);
  const updateNote = useCustomerExecutiveStore((s) => s.updateNote);
  const deleteNote = useCustomerExecutiveStore((s) => s.deleteNote);
  const sendPaymentLink = useCustomerExecutiveStore((s) => s.sendPaymentLink);
  const generatePaymentLinkForCustomer = useCustomerExecutiveStore(
    (s) => s.generatePaymentLinkForCustomer,
  );
  const copyPaymentLink = useCustomerExecutiveStore((s) => s.copyPaymentLink);

  const customer = getCustomer(customerId);
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  const orders = useMemo(
    () => getCustomerOrders(customerId),
    [getCustomerOrders, customerId],
  );
  const payments = useMemo(
    () => getCustomerPayments(customerId),
    [getCustomerPayments, customerId],
  );
  const complaints = useMemo(
    () => getCustomerComplaints(customerId),
    [getCustomerComplaints, customerId],
  );
  const notes = useMemo(
    () => getCustomerNotes(customerId),
    [getCustomerNotes, customerId],
  );
  const activities = useMemo(
    () => getCustomerActivities(customerId),
    [getCustomerActivities, customerId],
  );
  const orderStats = useMemo(
    () => getCustomerOrderStats(customerId),
    [getCustomerOrderStats, customerId],
  );

  if (!customer && !isLoading) {
    notFound();
  }

  const executive = executives.find(
    (e) => e.id === customer?.assignedExecutiveId,
  );

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote(customerId, newNote.trim());
    setNewNote("");
    notify.success("Note added");
  };

  const handleUpdateNote = (noteId: string) => {
    if (!editingContent.trim()) return;
    updateNote(noteId, editingContent.trim());
    setEditingNoteId(null);
    notify.success("Note updated");
  };

  const handleDeleteNote = () => {
    if (!deleteNoteId) return;
    deleteNote(deleteNoteId);
    setDeleteNoteId(null);
    notify.success("Note deleted");
  };

  const handleGeneratePaymentLink = async () => {
    if (!customer) return;
    const payment = generatePaymentLinkForCustomer({ customerId: customer.id });
    if (!payment) {
      notify.error(
        "No pending payment",
        "All payments are settled for this customer",
      );
      return;
    }
    const link = copyPaymentLink(payment.id);
    await navigator.clipboard.writeText(link);
    notify.success("Payment link sent", `Link copied for ${customer.name}`);
  };

  return (
    <CePageShell
      breadcrumbs={[
        { label: "Customer Executive", href: ROUTES.CUSTOMER_EXECUTIVE },
        {
          label: "Customer Management",
          href: `${ROUTES.CUSTOMER_EXECUTIVE}/customers`,
        },
        { label: customer?.name ?? "Profile" },
      ]}
      title={customer?.name ?? "Customer Profile"}
      subtitle={customer?.company}
    >
      {customer && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Card>
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
                <CeCustomerAvatar
                  name={customer.name}
                  id={customer.id}
                  size="lg"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold">{customer.name}</h2>
                    <CeStatusBadge status={customer.status} />
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                      {customer.company}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <Phone className="size-3.5" />
                      {customer.phone}
                    </span>
                    {customer.gst && <span>GSTIN: {customer.gst}</span>}
                    <span>Executive: {executive?.name}</span>
                  </div>
                  <div className="mt-4 flex gap-6">
                    <div>
                      <p className="text-xs text-[#64748B]">
                        Lifetime Purchase
                      </p>
                      <p className="text-lg font-bold">
                        {formatCurrency(customer.lifetimePurchase)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">Credit Limit</p>
                      <p className="text-lg font-bold">
                        {formatCurrency(customer.creditLimit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">Orders</p>
                      <p className="text-lg font-bold">
                        {orderStats.total}{" "}
                        <span className="text-xs font-normal text-[#64748B]">
                          (App: {orderStats.app} / Exec: {orderStats.executive})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="orders">
              <TabsList>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="complaints">Complaints</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="mt-4">
                <Card>
                  {orders.length === 0 ? (
                    <EmptyState title="No orders" className="border-none" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-orange-50/50">
                          <TableHead>Order ID</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="text-primary font-medium">
                              #{order.orderNumber}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-xs">
                              {order.items
                                .map((i) => `${i.productName} (${i.quantity})`)
                                .join(", ")}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(order.amount)}
                            </TableCell>
                            <TableCell>
                              <CeStatusBadge status={order.status} />
                            </TableCell>
                            <TableCell>
                              <CeStatusBadge status={order.orderSource} />
                            </TableCell>
                            <TableCell className="text-sm text-[#64748B]">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() =>
                                  router.push(
                                    `${ROUTES.CUSTOMER_EXECUTIVE}/tracking?order=${order.orderNumber}`,
                                  )
                                }
                              >
                                <Eye className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="payments" className="mt-4">
                <Card>
                  {payments.length === 0 ? (
                    <EmptyState title="No payments" className="border-none" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-orange-50/50">
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Link</TableHead>
                          <TableHead>Reminders</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>{formatCurrency(p.amount)}</TableCell>
                            <TableCell>
                              <CeStatusBadge status={p.status} />
                            </TableCell>
                            <TableCell className="text-sm text-[#64748B]">
                              {new Date(p.dueDate).toLocaleDateString("en-IN")}
                            </TableCell>
                            <TableCell>
                              <CeStatusBadge status={p.linkStatus} />
                            </TableCell>
                            <TableCell>{p.reminderCount}</TableCell>
                            <TableCell>
                              {p.status !== "PAID" && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => {
                                    sendPaymentLink(p.id);
                                    notify.success("Link sent");
                                  }}
                                >
                                  Send Link
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="complaints" className="mt-4">
                <Card>
                  {complaints.length === 0 ? (
                    <EmptyState title="No complaints" className="border-none" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-orange-50/50">
                          <TableHead>Ticket ID</TableHead>
                          <TableHead>Issue</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {complaints.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="text-primary font-medium">
                              #{c.ticketNumber}
                            </TableCell>
                            <TableCell>{c.issue}</TableCell>
                            <TableCell>
                              <CeStatusBadge status={c.priority} />
                            </TableCell>
                            <TableCell>
                              <CeStatusBadge status={c.status} />
                            </TableCell>
                            <TableCell className="text-sm text-[#64748B]">
                              {new Date(c.createdAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="mt-4">
                <Card className="p-6">
                  <CeTimeline activities={activities} />
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <Card className="p-6">
                  <div className="mb-4 flex gap-2">
                    <Input
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add an internal note..."
                      className="flex-1"
                    />
                    <Button onClick={handleAddNote}>
                      <Plus className="size-4" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {notes.length === 0 ? (
                      <EmptyState
                        title="No notes yet"
                        className="border-none"
                      />
                    ) : (
                      notes.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-lg border border-gray-100 bg-gray-50/50 p-4"
                        >
                          {editingNoteId === note.id ? (
                            <div className="flex gap-2">
                              <Input
                                value={editingContent}
                                onChange={(e) =>
                                  setEditingContent(e.target.value)
                                }
                                className="flex-1"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleUpdateNote(note.id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingNoteId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm">{note.content}</p>
                              <div className="mt-2 flex items-center justify-between">
                                <p className="text-xs text-[#64748B]">
                                  {new Date(note.createdAt).toLocaleString(
                                    "en-IN",
                                  )}{" "}
                                  • By {note.createdBy}
                                </p>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => {
                                      setEditingNoteId(note.id);
                                      setEditingContent(note.content);
                                    }}
                                  >
                                    <Pencil className="size-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => setDeleteNoteId(note.id)}
                                  >
                                    <Trash2 className="size-3.5 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-between"
                  render={
                    <Link
                      href={`${ROUTES.CUSTOMER_EXECUTIVE}/orders/new?customer=${customerId}`}
                    />
                  }
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="size-4" />
                    Create Order
                  </span>
                  →
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleGeneratePaymentLink}
                >
                  <CreditCard className="size-4" />
                  Generate Payment Link
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    router.push(
                      `${ROUTES.CUSTOMER_EXECUTIVE}/tracking?customer=${customerId}`,
                    )
                  }
                >
                  <Truck className="size-4" />
                  Track Order
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => initiateCall(customer.phone, customer.name)}
                >
                  <Phone className="size-4" />
                  Call Customer
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-green-700"
                  onClick={() =>
                    openWhatsApp(
                      customer.phone,
                      `Hi ${customer.name}, this is BuildQuick India support.`,
                      customer.name,
                    )
                  }
                >
                  <MessageSquareWarning className="size-4" />
                  WhatsApp
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {notes[0] ? (
                  <div>
                    <p className="text-sm">{notes[0].content}</p>
                    <p className="mt-2 text-xs text-[#64748B]">
                      {new Date(notes[0].createdAt).toLocaleString("en-IN")} •
                      By {notes[0].createdBy}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-[#64748B]">No notes yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <CeConfirmationDialog
        open={!!deleteNoteId}
        onOpenChange={(open) => !open && setDeleteNoteId(null)}
        title="Delete Note"
        description="Are you sure you want to delete this note? This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteNote}
      />
    </CePageShell>
  );
}
