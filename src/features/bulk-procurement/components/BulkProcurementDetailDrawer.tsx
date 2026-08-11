"use client";

import { format } from "date-fns";
import {
  Building2,
  ClipboardList,
  MessageCircle,
  Package,
  Phone,
  StickyNote,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { BulkProcurementStatusBadge } from "@/features/bulk-procurement/components/BulkProcurementStatusBadge";
import {
  addBulkFollowUp,
  addBulkNote,
  assignBulkProcurement,
  cancelBulkEnquiry,
  convertBulkEnquiry,
  createBulkQuotation,
  getBulkProcurementById,
  updateBulkFollowUpStatus,
  updateBulkProcurementStatus,
  updateBulkQuotationStatus,
} from "@/features/bulk-procurement/services/bulk-procurement.service";
import {
  BULK_DELIVERY_LABELS,
  BULK_STATUS_OPTIONS,
  TERMINAL_BULK_STATUSES,
  type BulkProcurementRequest,
  type BulkProcurementStatus,
} from "@/features/bulk-procurement/types";
import {
  fetchCustomerExecutives,
  type AdminUserListItem,
} from "@/services/admin-users";
import { getApiErrorMessage } from "@/services/api";
import { formatCurrency } from "@/utils/format-currency";
import { notify } from "@/utils/notify";

export type BulkDrawerIntent =
  | "view"
  | "assign"
  | "follow-up"
  | "status"
  | "quote"
  | "convert"
  | "cancel";

interface BulkProcurementDetailDrawerProps {
  enquiryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intent?: BulkDrawerIntent;
  onUpdated?: () => void;
}

function digitsPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function telHref(phone: string): string | null {
  const digits = digitsPhone(phone);
  if (!digits) return null;
  return `tel:+${digits.startsWith("91") ? digits : `91${digits}`}`;
}

function waHref(phone: string): string | null {
  const digits = digitsPhone(phone);
  if (!digits) return null;
  const withCountry = digits.startsWith("91") ? digits : `91${digits}`;
  return `https://wa.me/${withCountry}`;
}

function Section({
  title,
  icon: Icon,
  children,
  id,
}: {
  title: string;
  icon: typeof Package;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-[#64748B]" />
        <h3 className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

export function BulkProcurementDetailDrawer({
  enquiryId,
  open,
  onOpenChange,
  intent = "view",
  onUpdated,
}: BulkProcurementDetailDrawerProps) {
  const [request, setRequest] = useState<BulkProcurementRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [executives, setExecutives] = useState<AdminUserListItem[]>([]);
  const [assignExecutiveId, setAssignExecutiveId] = useState("");
  const [statusValue, setStatusValue] = useState<BulkProcurementStatus>("NEW");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [noteText, setNoteText] = useState("");
  const [quoteForm, setQuoteForm] = useState({
    materialLabel: "",
    quantity: "",
    unit: "",
    unitPrice: "",
    deliveryCharge: "",
    gstPercent: "18",
    discountAmount: "",
    notes: "",
  });
  const [cancelRemarks, setCancelRemarks] = useState("");

  const refresh = useCallback(async () => {
    if (!enquiryId) return;
    setIsLoading(true);
    try {
      const detail = await getBulkProcurementById(enquiryId);
      setRequest(detail);
      if (detail) {
        setStatusValue(detail.status);
        setAssignExecutiveId(detail.assignedExecutiveId ?? "");
        setQuoteForm((prev) => ({
          ...prev,
          materialLabel: detail.material || prev.materialLabel,
          quantity: detail.quantity ? String(detail.quantity) : prev.quantity,
          unit: detail.unit || prev.unit,
        }));
      }
    } catch (error) {
      notify.error("Failed to load enquiry", getApiErrorMessage(error));
      setRequest(null);
    } finally {
      setIsLoading(false);
    }
  }, [enquiryId]);

  useEffect(() => {
    if (!open || !enquiryId) return;
    void refresh();
  }, [open, enquiryId, refresh]);

  useEffect(() => {
    if (!open) return;
    let ignore = false;
    async function loadExecutives() {
      try {
        const response = await fetchCustomerExecutives({
          status: "ACTIVE",
          page: 1,
          limit: 100,
        });
        if (!ignore) setExecutives(response.data);
      } catch {
        if (!ignore) setExecutives([]);
      }
    }
    void loadExecutives();
    return () => {
      ignore = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !request || intent === "view") return;
    const idMap: Record<BulkDrawerIntent, string> = {
      view: "",
      assign: "bulk-assign",
      "follow-up": "bulk-followups",
      status: "bulk-status",
      quote: "bulk-quotes",
      convert: "bulk-quotes",
      cancel: "bulk-cancel",
    };
    const elId = idMap[intent];
    if (!elId) return;
    const t = window.setTimeout(() => {
      document.getElementById(elId)?.scrollIntoView({ behavior: "smooth" });
    }, 120);
    return () => window.clearTimeout(t);
  }, [open, request, intent]);

  const isTerminal = useMemo(
    () => (request ? TERMINAL_BULK_STATUSES.includes(request.status) : false),
    [request],
  );

  const acceptedQuote = useMemo(
    () => request?.quotations.find((q) => q.status === "ACCEPTED") ?? null,
    [request],
  );

  const afterMutation = async () => {
    await refresh();
    onUpdated?.();
  };

  const handleAssign = async () => {
    if (!request || !assignExecutiveId) {
      notify.error("Select an executive");
      return;
    }
    setIsSaving(true);
    try {
      await assignBulkProcurement(request.id, {
        executiveId: assignExecutiveId,
      });
      notify.success("Executive assigned");
      await afterMutation();
    } catch (error) {
      notify.error("Assign failed", getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!request) return;
    setIsSaving(true);
    try {
      await updateBulkProcurementStatus(
        request.id,
        statusValue,
        statusRemarks.trim() || undefined,
      );
      notify.success("Status updated");
      setStatusRemarks("");
      await afterMutation();
    } catch (error) {
      notify.error("Status update failed", getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFollowUp = async () => {
    if (!request || !followUpAt || !followUpNote.trim()) {
      notify.error("Follow-up date and note are required");
      return;
    }
    setIsSaving(true);
    try {
      await addBulkFollowUp(request.id, {
        followUpAt: new Date(followUpAt).toISOString(),
        note: followUpNote.trim(),
      });
      notify.success("Follow-up added");
      setFollowUpAt("");
      setFollowUpNote("");
      await afterMutation();
    } catch (error) {
      notify.error("Follow-up failed", getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleFollowUpStatus = async (
    followUpId: string,
    status: "COMPLETED" | "MISSED" | "PENDING",
  ) => {
    if (!request) return;
    setIsSaving(true);
    try {
      await updateBulkFollowUpStatus(request.id, followUpId, status);
      notify.success("Follow-up updated");
      await afterMutation();
    } catch (error) {
      notify.error("Update failed", getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!request || !noteText.trim()) return;
    setIsSaving(true);
    try {
      await addBulkNote(request.id, noteText.trim());
      notify.success("Note added");
      setNoteText("");
      await afterMutation();
    } catch (error) {
      notify.error("Note failed", getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateQuote = async () => {
    if (!request) return;
    const quantity = Number(quoteForm.quantity);
    const unitPrice = Number(quoteForm.unitPrice);
    if (
      !quoteForm.materialLabel.trim() ||
      !quoteForm.unit.trim() ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      notify.error("Fill material, quantity, unit and unit price");
      return;
    }
    setIsSaving(true);
    try {
      await createBulkQuotation(request.id, {
        materialLabel: quoteForm.materialLabel.trim(),
        quantity,
        unit: quoteForm.unit.trim(),
        unitPrice,
        deliveryCharge: quoteForm.deliveryCharge
          ? Number(quoteForm.deliveryCharge)
          : undefined,
        gstPercent: quoteForm.gstPercent
          ? Number(quoteForm.gstPercent)
          : undefined,
        discountAmount: quoteForm.discountAmount
          ? Number(quoteForm.discountAmount)
          : undefined,
        notes: quoteForm.notes.trim() || undefined,
      });
      notify.success("Quotation created");
      await afterMutation();
    } catch (error) {
      notify.error("Quote failed", getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuoteStatus = async (
    quotationId: string,
    status: "SENT" | "ACCEPTED" | "REJECTED",
  ) => {
    if (!request) return;
    setIsSaving(true);
    try {
      await updateBulkQuotationStatus(request.id, quotationId, status);
      notify.success(`Quotation marked ${status.toLowerCase()}`);
      await afterMutation();
    } catch (error) {
      notify.error("Quote update failed", getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvert = async () => {
    if (!request) return;
    if (!acceptedQuote) {
      notify.error("Accept a quotation before converting to an order");
      return;
    }
    setIsSaving(true);
    try {
      await convertBulkEnquiry(request.id, {
        quotationId: acceptedQuote.id,
        addressId: request.addressId ?? undefined,
      });
      notify.success("Converted to order");
      await afterMutation();
    } catch (error) {
      notify.error("Convert failed", getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!request) return;
    setIsSaving(true);
    try {
      await cancelBulkEnquiry(
        request.id,
        cancelRemarks.trim() || undefined,
      );
      notify.success("Enquiry cancelled");
      setCancelRemarks("");
      await afterMutation();
    } catch (error) {
      notify.error("Cancel failed", getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const callLink = request ? telHref(request.customerPhone) : null;
  const whatsappLink = request ? waHref(request.customerPhone) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 space-y-0 border-b border-gray-100 px-6 py-5 pr-14 text-left">
          {isLoading && !request ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : request ? (
            <>
              <SheetTitle className="flex items-center gap-2.5 text-xl font-bold text-[#1A1A1A]">
                <Building2 className="text-primary size-5" />
                {request.enquiryNumber}
              </SheetTitle>
              <SheetDescription className="mt-1.5 text-sm text-[#64748B]">
                {request.company} · {request.customerName}
              </SheetDescription>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <BulkProcurementStatusBadge status={request.status} />
                <span className="text-sm font-semibold text-[#1A1A1A]">
                  {request.pipelineDisplay}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {callLink ? (
                  <Button
                    size="sm"
                    variant="outline"
                    render={<a href={callLink} />}
                  >
                    <Phone className="size-4" />
                    Call
                  </Button>
                ) : null}
                {whatsappLink ? (
                  <Button
                    size="sm"
                    variant="outline"
                    render={
                      <a href={whatsappLink} target="_blank" rel="noreferrer" />
                    }
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </Button>
                ) : null}
                {acceptedQuote && !isTerminal ? (
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    disabled={isSaving}
                    onClick={() => void handleConvert()}
                  >
                    Convert to Order
                  </Button>
                ) : null}
              </div>
            </>
          ) : (
            <SheetTitle>Enquiry not found</SheetTitle>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading && !request ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : request ? (
            <div className="space-y-8">
              <Section title="Customer" icon={User}>
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-100 bg-[#F5F6F8] p-4 text-sm">
                  <div>
                    <p className="text-xs text-[#64748B]">Name</p>
                    <p className="font-medium text-[#1A1A1A]">
                      {request.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Phone</p>
                    <p className="font-medium text-[#1A1A1A]">
                      {request.customerPhone || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Company</p>
                    <p className="font-medium text-[#1A1A1A]">
                      {request.company}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Email</p>
                    <p className="font-medium text-[#1A1A1A]">
                      {request.customerEmail || "—"}
                    </p>
                  </div>
                </div>
              </Section>

              <Section title="Requirement" icon={Package}>
                <div className="space-y-2 rounded-lg border border-gray-100 p-4 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-[#64748B]">Project</span>
                    <span className="font-medium text-[#1A1A1A]">
                      {request.project}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#64748B]">Material</span>
                    <span className="font-medium text-[#1A1A1A]">
                      {request.material}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#64748B]">Quantity</span>
                    <span className="font-medium text-[#1A1A1A]">
                      {request.quantity} {request.unit}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#64748B]">Estimated</span>
                    <span className="font-medium text-[#1A1A1A]">
                      {request.estimatedValue != null
                        ? formatCurrency(request.estimatedValue)
                        : "Awaiting Quote"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#64748B]">Quoted</span>
                    <span className="font-medium text-[#1A1A1A]">
                      {request.quotedValue != null
                        ? formatCurrency(request.quotedValue)
                        : "—"}
                    </span>
                  </div>
                </div>
              </Section>

              <Section title="Delivery" icon={ClipboardList}>
                <div className="space-y-2 rounded-lg border border-gray-100 bg-[#F5F6F8] p-4 text-sm">
                  <p className="font-medium text-[#1A1A1A]">
                    {request.projectLocation}
                  </p>
                  <p className="text-[#64748B]">
                    {[request.city, request.state, request.pincode]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                  <p className="text-[#64748B]">
                    Requested:{" "}
                    {request.deliveryRequirement
                      ? BULK_DELIVERY_LABELS[request.deliveryRequirement]
                      : request.deliveryDate
                        ? format(
                            new Date(request.deliveryDate),
                            "dd MMM yyyy",
                          )
                        : "—"}
                  </p>
                </div>
              </Section>

              {(request.remarks || request.additionalNotes) && (
                <Section title="Customer Notes" icon={StickyNote}>
                  <p className="rounded-lg border border-gray-100 bg-[#F5F6F8] p-4 text-sm text-[#64748B]">
                    {request.remarks || request.additionalNotes}
                  </p>
                </Section>
              )}

              <Section title="Assignment" icon={User} id="bulk-assign">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Select
                    value={assignExecutiveId || null}
                    onValueChange={(v) => setAssignExecutiveId(v ?? "")}
                    disabled={isTerminal || isSaving}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select executive" />
                    </SelectTrigger>
                    <SelectContent>
                      {executives.map((exec) => (
                        <SelectItem key={exec.id} value={exec.id}>
                          {exec.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    disabled={isTerminal || isSaving || !assignExecutiveId}
                    onClick={() => void handleAssign()}
                  >
                    Assign
                  </Button>
                </div>
                {request.assignedExecutiveName ? (
                  <p className="text-xs text-[#64748B]">
                    Currently: {request.assignedExecutiveName}
                  </p>
                ) : null}
              </Section>

              <Section title="Update Status" icon={ClipboardList} id="bulk-status">
                <div className="space-y-3">
                  <Select
                    value={statusValue}
                    onValueChange={(v) => {
                      if (!v) return;
                      setStatusValue(v as BulkProcurementStatus);
                    }}
                    disabled={isTerminal || isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BULK_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Remarks (optional)"
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    disabled={isTerminal || isSaving}
                  />
                  <Button
                    disabled={isTerminal || isSaving}
                    onClick={() => void handleStatusUpdate()}
                  >
                    Save Status
                  </Button>
                </div>
              </Section>

              <Section title="Follow-ups" icon={ClipboardList} id="bulk-followups">
                <div className="space-y-3">
                  {!isTerminal ? (
                    <div className="space-y-2 rounded-lg border border-dashed border-gray-200 p-3">
                      <Label htmlFor="followUpAt">Follow-up at</Label>
                      <Input
                        id="followUpAt"
                        type="datetime-local"
                        value={followUpAt}
                        onChange={(e) => setFollowUpAt(e.target.value)}
                      />
                      <Textarea
                        placeholder="Note"
                        value={followUpNote}
                        onChange={(e) => setFollowUpNote(e.target.value)}
                      />
                      <Button
                        size="sm"
                        disabled={isSaving}
                        onClick={() => void handleAddFollowUp()}
                      >
                        Add Follow-up
                      </Button>
                    </div>
                  ) : null}
                  {request.followUps.length === 0 ? (
                    <p className="text-sm text-[#64748B]">No follow-ups yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {request.followUps.map((fu) => (
                        <li
                          key={fu.id}
                          className="rounded-lg border border-gray-100 p-3 text-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-[#1A1A1A]">
                                {fu.followUpAt
                                  ? format(
                                      new Date(fu.followUpAt),
                                      "dd MMM yyyy, HH:mm",
                                    )
                                  : "—"}
                              </p>
                              <p className="text-[#64748B]">{fu.note}</p>
                              <p className="mt-1 text-xs text-gray-400">
                                {fu.status}
                                {fu.createdByName
                                  ? ` · ${fu.createdByName}`
                                  : ""}
                              </p>
                            </div>
                            {fu.status === "PENDING" && !isTerminal ? (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isSaving}
                                  onClick={() =>
                                    void handleFollowUpStatus(
                                      fu.id,
                                      "COMPLETED",
                                    )
                                  }
                                >
                                  Done
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={isSaving}
                                  onClick={() =>
                                    void handleFollowUpStatus(fu.id, "MISSED")
                                  }
                                >
                                  Missed
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Section>

              <Section title="Internal Notes" icon={StickyNote}>
                <div className="space-y-3">
                  {!isTerminal ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add internal note..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                      />
                      <Button
                        size="sm"
                        disabled={isSaving || !noteText.trim()}
                        onClick={() => void handleAddNote()}
                      >
                        Add Note
                      </Button>
                    </div>
                  ) : null}
                  {request.internalNotes.length === 0 ? (
                    <p className="text-sm text-[#64748B]">No internal notes.</p>
                  ) : (
                    <ul className="space-y-2">
                      {request.internalNotes.map((n) => (
                        <li
                          key={n.id}
                          className="rounded-lg border border-gray-100 bg-[#F5F6F8] p-3 text-sm"
                        >
                          <p className="text-[#1A1A1A]">{n.note}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            {format(new Date(n.createdAt), "dd MMM yyyy, HH:mm")}
                            {n.createdByName ? ` · ${n.createdByName}` : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Section>

              <Section title="Quotations" icon={Package} id="bulk-quotes">
                <div className="space-y-4">
                  {!isTerminal ? (
                    <div className="space-y-2 rounded-lg border border-dashed border-gray-200 p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <Label>Material</Label>
                          <Input
                            value={quoteForm.materialLabel}
                            onChange={(e) =>
                              setQuoteForm((p) => ({
                                ...p,
                                materialLabel: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={quoteForm.quantity}
                            onChange={(e) =>
                              setQuoteForm((p) => ({
                                ...p,
                                quantity: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Unit</Label>
                          <Input
                            value={quoteForm.unit}
                            onChange={(e) =>
                              setQuoteForm((p) => ({
                                ...p,
                                unit: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Unit price</Label>
                          <Input
                            type="number"
                            value={quoteForm.unitPrice}
                            onChange={(e) =>
                              setQuoteForm((p) => ({
                                ...p,
                                unitPrice: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Delivery charge</Label>
                          <Input
                            type="number"
                            value={quoteForm.deliveryCharge}
                            onChange={(e) =>
                              setQuoteForm((p) => ({
                                ...p,
                                deliveryCharge: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label>GST %</Label>
                          <Input
                            type="number"
                            value={quoteForm.gstPercent}
                            onChange={(e) =>
                              setQuoteForm((p) => ({
                                ...p,
                                gstPercent: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Discount</Label>
                          <Input
                            type="number"
                            value={quoteForm.discountAmount}
                            onChange={(e) =>
                              setQuoteForm((p) => ({
                                ...p,
                                discountAmount: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <Textarea
                        placeholder="Quote notes (optional)"
                        value={quoteForm.notes}
                        onChange={(e) =>
                          setQuoteForm((p) => ({
                            ...p,
                            notes: e.target.value,
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        disabled={isSaving}
                        onClick={() => void handleCreateQuote()}
                      >
                        Create Quote
                      </Button>
                    </div>
                  ) : null}

                  {request.quotations.length === 0 ? (
                    <p className="text-sm text-[#64748B]">No quotations yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {request.quotations.map((q) => (
                        <li
                          key={q.id}
                          className="rounded-lg border border-gray-100 p-3 text-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-[#1A1A1A]">
                                {q.quotationNumber} · {q.materialLabel}
                              </p>
                              <p className="text-[#64748B]">
                                {q.quantity} {q.unit} @{" "}
                                {formatCurrency(q.unitPrice)}
                              </p>
                              <p className="mt-1 font-semibold text-[#1A1A1A]">
                                {formatCurrency(q.totalAmount)} · {q.status}
                              </p>
                            </div>
                            {!isTerminal ? (
                              <div className="flex flex-col gap-1">
                                {q.status === "DRAFT" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={isSaving}
                                    onClick={() =>
                                      void handleQuoteStatus(q.id, "SENT")
                                    }
                                  >
                                    Send
                                  </Button>
                                ) : null}
                                {(q.status === "SENT" ||
                                  q.status === "VIEWED" ||
                                  q.status === "DRAFT") && (
                                  <Button
                                    size="sm"
                                    disabled={isSaving}
                                    onClick={() =>
                                      void handleQuoteStatus(q.id, "ACCEPTED")
                                    }
                                  >
                                    Accept
                                  </Button>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {acceptedQuote && !isTerminal ? (
                    <Button
                      className="bg-primary w-full hover:bg-primary/90"
                      disabled={isSaving}
                      onClick={() => void handleConvert()}
                    >
                      Convert Accepted Quote to Order
                    </Button>
                  ) : null}
                </div>
              </Section>

              <Section title="Activity" icon={ClipboardList}>
                {request.timeline.length === 0 ? (
                  <p className="text-sm text-[#64748B]">No activity yet.</p>
                ) : (
                  <div className="relative space-y-0">
                    {request.timeline.map((event, index) => (
                      <div key={event.id} className="flex gap-3 pb-4">
                        <div className="flex flex-col items-center">
                          <div className="bg-primary size-2.5 rounded-full" />
                          {index < request.timeline.length - 1 && (
                            <div className="mt-1 w-px flex-1 bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm font-medium text-[#1A1A1A]">
                            {event.title}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            {event.description}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {format(
                              new Date(event.date),
                              "dd MMM yyyy, HH:mm",
                            )}
                            {event.actor ? ` · ${event.actor}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {!isTerminal ? (
                <Section title="Cancel Enquiry" icon={X} id="bulk-cancel">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Cancellation remarks (optional)"
                      value={cancelRemarks}
                      onChange={(e) => setCancelRemarks(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      className="text-red-600"
                      disabled={isSaving}
                      onClick={() => void handleCancel()}
                    >
                      Cancel Enquiry
                    </Button>
                  </div>
                </Section>
              ) : null}
            </div>
          ) : null}
        </div>

        {request && !isLoading ? (
          <SheetFooter className="shrink-0 border-t border-gray-100 bg-white px-6 py-4">
            <Button
              variant="outline"
              className="ml-auto gap-2"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
              Close
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
