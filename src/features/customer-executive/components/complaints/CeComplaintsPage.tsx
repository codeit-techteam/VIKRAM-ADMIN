"use client";

import {
  AlertTriangle,
  CheckCircle2,
  MessageSquareWarning,
  MoreHorizontal,
  Phone,
  Plus,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
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
import { CeMetricCard } from "@/features/customer-executive/components/shared/CeMetricCard";
import { CePageShell } from "@/features/customer-executive/components/shared/CePageShell";
import { CeSearchFilter } from "@/features/customer-executive/components/shared/CeSearchFilter";
import { CeStatusBadge } from "@/features/customer-executive/components/shared/CeStatusBadge";
import { CeRaiseComplaintDialog } from "@/features/customer-executive/components/shared/CeRaiseComplaintDialog";
import { CeTableSkeleton } from "@/features/customer-executive/components/shared/CeTableSkeleton";
import { CeTimeline } from "@/features/customer-executive/components/shared/CeTimeline";
import { useCeLoading } from "@/features/customer-executive/hooks/use-ce-loading";
import { initiateCall } from "@/features/customer-executive/utils/communication";
import { CE_ISSUE_TYPES } from "@/features/customer-executive/mock/seed";
import {
  CE_PAGE_SIZE,
  EMPTY_COMPLAINT_FILTERS,
  type CeComplaint,
  type CeComplaintFilters,
} from "@/features/customer-executive/types";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import { notify } from "@/utils/notify";

export function CeComplaintsPage() {
  const searchParams = useSearchParams();
  const { isLoading } = useCeLoading();
  const queryComplaints = useCustomerExecutiveStore((s) => s.queryComplaints);
  const complaints = useCustomerExecutiveStore((s) => s.complaints);
  const executives = useCustomerExecutiveStore((s) => s.executives);
  const updateComplaintStatus = useCustomerExecutiveStore(
    (s) => s.updateComplaintStatus,
  );
  const addComplaintNote = useCustomerExecutiveStore((s) => s.addComplaintNote);
  const getCustomer = useCustomerExecutiveStore((s) => s.getCustomer);
  const markNotificationRead = useCustomerExecutiveStore(
    (s) => s.markNotificationRead,
  );
  const notifications = useCustomerExecutiveStore((s) => s.notifications);
  const getCustomerActivities = useCustomerExecutiveStore(
    (s) => s.getCustomerActivities,
  );

  const [draftFilters, setDraftFilters] = useState<CeComplaintFilters>(
    EMPTY_COMPLAINT_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<CeComplaintFilters>(
    EMPTY_COMPLAINT_FILTERS,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] =
    useState<CeComplaint | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [showEscalation, setShowEscalation] = useState(true);
  const [raiseDialogOpen, setRaiseDialogOpen] = useState(false);

  useEffect(() => {
    const orderParam = searchParams.get("order");
    if (orderParam) {
      const filters = { ...EMPTY_COMPLAINT_FILTERS, search: orderParam };
      setDraftFilters(filters);
      setAppliedFilters(filters);
      setCurrentPage(1);

      const match = complaints.find(
        (c) =>
          c.orderNumber?.toLowerCase().includes(orderParam.toLowerCase()) ||
          c.ticketNumber.toLowerCase().includes(orderParam.toLowerCase()),
      );
      if (match) setSelectedComplaint(match);
    }
  }, [searchParams, complaints]);

  const queryResult = useMemo(
    () =>
      queryComplaints({
        page: currentPage,
        limit: CE_PAGE_SIZE,
        filters: appliedFilters,
      }),
    [queryComplaints, currentPage, appliedFilters, complaints],
  );

  const stats = useMemo(
    () => ({
      open: complaints.filter((c) => c.status === "OPEN").length,
      inProgress: complaints.filter((c) => c.status === "IN_PROGRESS").length,
      resolved: complaints.filter((c) => c.status === "RESOLVED").length,
      escalated: complaints.filter((c) => c.status === "ESCALATED").length,
    }),
    [complaints],
  );

  const escalationNotif = notifications.find(
    (n) => n.type === "error" && !n.read,
  );

  const handleStatusChange = (
    complaintId: string,
    status: CeComplaint["status"],
  ) => {
    updateComplaintStatus(complaintId, status);
    notify.success(`Complaint ${status.toLowerCase().replace("_", " ")}`);
    if (selectedComplaint?.id === complaintId) {
      setSelectedComplaint({ ...selectedComplaint, status });
    }
  };

  const handleAddNote = () => {
    if (!selectedComplaint || !noteInput.trim()) return;
    addComplaintNote(selectedComplaint.id, noteInput.trim());
    setNoteInput("");
    notify.success("Note added");
  };

  return (
    <CePageShell
      breadcrumbs={[
        { label: "Customer Executive", href: ROUTES.CUSTOMER_EXECUTIVE },
        { label: "Complaints" },
      ]}
      title="Complaint Management"
      subtitle="Track and resolve customer complaints efficiently."
      actions={
        <Button onClick={() => setRaiseDialogOpen(true)}>
          <Plus className="size-4" />
          Raise Complaint
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CeMetricCard
          label="Open Complaints"
          value={stats.open}
          isLoading={isLoading}
        />
        <CeMetricCard
          label="In Progress"
          value={stats.inProgress}
          isLoading={isLoading}
          valueVariant="warning"
        />
        <CeMetricCard
          label="Resolved Today"
          value={stats.resolved}
          isLoading={isLoading}
        />
        <CeMetricCard
          label="Escalated"
          value={stats.escalated}
          isLoading={isLoading}
        />
      </div>

      <CeSearchFilter
        sticky
        search={draftFilters.search}
        onSearchChange={(v) => setDraftFilters((f) => ({ ...f, search: v }))}
        searchPlaceholder="Search across helpdesk..."
        filters={[
          {
            key: "status",
            label: "Status",
            value: draftFilters.status,
            onChange: (v) =>
              setDraftFilters((f) => ({
                ...f,
                status: v as CeComplaintFilters["status"],
              })),
            options: [
              { label: "All Status", value: "ALL" },
              { label: "Open", value: "OPEN" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Resolved", value: "RESOLVED" },
              { label: "Escalated", value: "ESCALATED" },
            ],
          },
          {
            key: "priority",
            label: "Priority",
            value: draftFilters.priority,
            onChange: (v) =>
              setDraftFilters((f) => ({
                ...f,
                priority: v as CeComplaintFilters["priority"],
              })),
            options: [
              { label: "All Priority", value: "ALL" },
              { label: "Low", value: "LOW" },
              { label: "Medium", value: "MEDIUM" },
              { label: "High", value: "HIGH" },
              { label: "Critical", value: "CRITICAL" },
            ],
          },
          {
            key: "issueType",
            label: "Issue Type",
            value: draftFilters.issueType,
            onChange: (v) => setDraftFilters((f) => ({ ...f, issueType: v })),
            options: CE_ISSUE_TYPES.map((t) => ({
              label: t === "ALL" ? "All Types" : t,
              value: t,
            })),
          },
        ]}
        onClear={() => {
          setDraftFilters(EMPTY_COMPLAINT_FILTERS);
          setAppliedFilters(EMPTY_COMPLAINT_FILTERS);
          setCurrentPage(1);
        }}
      />

      <Button
        size="sm"
        onClick={() => {
          setAppliedFilters(draftFilters);
          setCurrentPage(1);
        }}
      >
        Apply Filters
      </Button>

      {isLoading ? (
        <CeTableSkeleton columns={7} />
      ) : queryResult.items.length === 0 ? (
        <EmptyState title="No complaints found" />
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-orange-50/50 hover:bg-orange-50/50">
                <TableHead>Complaint ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {queryResult.items.map((complaint) => {
                const exec = executives.find(
                  (e) => e.id === complaint.assignedExecutiveId,
                );
                return (
                  <TableRow key={complaint.id}>
                    <TableCell className="text-primary font-medium">
                      #{complaint.ticketNumber}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{complaint.customerName}</p>
                      <p className="text-xs text-[#64748B]">
                        {complaint.company}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {complaint.issue}
                    </TableCell>
                    <TableCell>
                      <CeStatusBadge status={complaint.priority} />
                    </TableCell>
                    <TableCell>
                      <CeStatusBadge status={complaint.status} />
                    </TableCell>
                    <TableCell>{exec?.name ?? "—"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setSelectedComplaint(complaint)}
                          >
                            <MessageSquareWarning className="size-4" />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(complaint.id, "RESOLVED")
                            }
                          >
                            <CheckCircle2 className="size-4 text-green-600" />
                            Resolve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(complaint.id, "ESCALATED")
                            }
                          >
                            <AlertTriangle className="size-4 text-red-600" />
                            Escalate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const customer = getCustomer(
                                complaint.customerId,
                              );
                              if (customer) {
                                initiateCall(customer.phone, customer.name);
                              }
                            }}
                          >
                            <Phone className="size-4" />
                            Call Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Pagination
            currentPage={queryResult.page}
            totalPages={queryResult.totalPages}
            pageSize={CE_PAGE_SIZE}
            totalItems={queryResult.total}
            onPageChange={setCurrentPage}
            itemLabel="complaints"
          />
        </div>
      )}

      <Sheet
        open={!!selectedComplaint}
        onOpenChange={(open) => !open && setSelectedComplaint(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selectedComplaint && (
            <>
              <SheetHeader>
                <SheetTitle>#{selectedComplaint.ticketNumber}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-3">
                  <CeCustomerAvatar
                    name={selectedComplaint.customerName}
                    id={selectedComplaint.customerId}
                  />
                  <div>
                    <p className="font-semibold">
                      {selectedComplaint.customerName}
                    </p>
                    <p className="text-sm text-[#64748B]">
                      {selectedComplaint.company}
                    </p>
                  </div>
                </div>

                {selectedComplaint.orderNumber && (
                  <div>
                    <p className="text-xs text-[#64748B]">Order</p>
                    <p className="text-primary font-medium">
                      #{selectedComplaint.orderNumber}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-[#64748B]">Issue</p>
                  <p className="font-medium">{selectedComplaint.issue}</p>
                  <div className="mt-2 flex gap-2">
                    <CeStatusBadge status={selectedComplaint.priority} />
                    <CeStatusBadge status={selectedComplaint.status} />
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold">Timeline</p>
                  <CeTimeline
                    activities={getCustomerActivities(
                      selectedComplaint.customerId,
                    )}
                    maxItems={5}
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold">Internal Notes</p>
                  <div className="space-y-2">
                    {selectedComplaint.internalNotes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-lg bg-gray-50 p-3 text-sm"
                      >
                        {note.content}
                        <p className="mt-1 text-xs text-[#64748B]">
                          {note.createdBy}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Input
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Add resolution note..."
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleAddNote}>
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() =>
                      handleStatusChange(selectedComplaint.id, "RESOLVED")
                    }
                  >
                    <CheckCircle2 className="size-4" />
                    Resolve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      handleStatusChange(selectedComplaint.id, "ESCALATED")
                    }
                  >
                    Escalate
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AnimatePresence>
        {showEscalation && escalationNotif && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed right-6 bottom-6 z-50 w-80 rounded-xl border border-red-200 bg-white p-4 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 text-red-500" />
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase">
                  Recent Escalation
                </p>
                <p className="mt-1 text-sm">{escalationNotif.message}</p>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    className="text-primary text-sm font-medium hover:underline"
                    onClick={() => {
                      const escalated = complaints.find(
                        (c) => c.status === "ESCALATED",
                      );
                      if (escalated) setSelectedComplaint(escalated);
                      setShowEscalation(false);
                    }}
                  >
                    Review Now
                  </button>
                  <button
                    type="button"
                    className="text-sm text-[#64748B] hover:underline"
                    onClick={() => {
                      if (escalationNotif) {
                        markNotificationRead(escalationNotif.id);
                      }
                      setShowEscalation(false);
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CeRaiseComplaintDialog
        open={raiseDialogOpen}
        onOpenChange={setRaiseDialogOpen}
        onCreated={(complaint) => setSelectedComplaint(complaint)}
      />
    </CePageShell>
  );
}
