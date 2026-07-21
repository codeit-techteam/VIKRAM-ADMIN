export type BulkProcurementStatus =
  "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface MaterialRequirement {
  id: string;
  material: string;
  quantity: string;
  unit: string;
  estimatedValue: number;
}

export interface ProcurementTimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  actor?: string;
}

export interface BulkProcurementRequest {
  id: string;
  company: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  project: string;
  projectLocation: string;
  expectedOrderValue: number;
  status: BulkProcurementStatus;
  assignedExecutiveId?: string;
  assignedExecutiveName?: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  materials: MaterialRequirement[];
  timeline: ProcurementTimelineEvent[];
}

export interface BulkProcurementDashboardStats {
  openRequests: number;
  assigned: number;
  completed: number;
  revenuePotential: number;
}

export const MOCK_BULK_PROCUREMENT: BulkProcurementRequest[] = [
  {
    id: "bp-001",
    company: "Skyline Infra Pvt Ltd",
    customerId: "cust-002",
    customerName: "Rajesh Kumar",
    customerPhone: "+91 91234 56789",
    project: "Skyline Heights Phase 2",
    projectLocation: "Hinjewadi, Pune",
    expectedOrderValue: 4500000,
    status: "ASSIGNED",
    assignedExecutiveId: "exec-001",
    assignedExecutiveName: "Priya Sharma",
    createdAt: "2026-07-18",
    updatedAt: "2026-07-20",
    notes:
      "High-rise residential project. Need bulk cement and steel. Delivery timeline critical.",
    materials: [
      {
        id: "mr-001",
        material: "OPC 53 Grade Cement",
        quantity: "500",
        unit: "bags",
        estimatedValue: 1750000,
      },
      {
        id: "mr-002",
        material: "TMT Steel Bars (12mm)",
        quantity: "25",
        unit: "MT",
        estimatedValue: 1875000,
      },
      {
        id: "mr-003",
        material: "River Sand",
        quantity: "200",
        unit: "cubic ft",
        estimatedValue: 875000,
      },
    ],
    timeline: [
      {
        id: "tl-001",
        title: "Request Submitted",
        description: "Customer submitted bulk procurement request via app",
        date: "2026-07-18T10:00:00",
        actor: "Rajesh Kumar",
      },
      {
        id: "tl-002",
        title: "Executive Assigned",
        description: "Priya Sharma assigned to handle this request",
        date: "2026-07-19T09:30:00",
        actor: "Admin",
      },
      {
        id: "tl-003",
        title: "Site Visit Scheduled",
        description: "Site visit planned for material assessment",
        date: "2026-07-20T14:00:00",
        actor: "Priya Sharma",
      },
    ],
  },
  {
    id: "bp-002",
    company: "Ravi Teja Constructions",
    customerId: "cust-001",
    customerName: "Ravi Teja",
    customerPhone: "+91 98765 43210",
    project: "Commercial Complex - Andheri",
    projectLocation: "Andheri East, Mumbai",
    expectedOrderValue: 2800000,
    status: "OPEN",
    createdAt: "2026-07-20",
    updatedAt: "2026-07-20",
    notes: "Urgent requirement for foundation work starting next week.",
    materials: [
      {
        id: "mr-004",
        material: "PPC Cement",
        quantity: "300",
        unit: "bags",
        estimatedValue: 1050000,
      },
      {
        id: "mr-005",
        material: "Aggregates (20mm)",
        quantity: "150",
        unit: "cubic ft",
        estimatedValue: 450000,
      },
      {
        id: "mr-006",
        material: "Ready Mix Concrete M25",
        quantity: "80",
        unit: "cubic m",
        estimatedValue: 1300000,
      },
    ],
    timeline: [
      {
        id: "tl-004",
        title: "Request Submitted",
        description: "New bulk procurement request received",
        date: "2026-07-20T11:30:00",
        actor: "Ravi Teja",
      },
    ],
  },
  {
    id: "bp-003",
    company: "Metro Build Solutions",
    customerId: "cust-003",
    customerName: "Amit Verma",
    customerPhone: "+91 99887 76655",
    project: "Metro Station Adjacent Building",
    projectLocation: "Noida Sector 62",
    expectedOrderValue: 6200000,
    status: "IN_PROGRESS",
    assignedExecutiveId: "exec-002",
    assignedExecutiveName: "Vikram Singh",
    createdAt: "2026-07-10",
    updatedAt: "2026-07-19",
    notes:
      "Government project. Requires GST invoices and quality certificates.",
    materials: [
      {
        id: "mr-007",
        material: "OPC 53 Grade Cement",
        quantity: "800",
        unit: "bags",
        estimatedValue: 2800000,
      },
      {
        id: "mr-008",
        material: "TMT Steel Bars (16mm)",
        quantity: "40",
        unit: "MT",
        estimatedValue: 3000000,
      },
      {
        id: "mr-009",
        material: "Fly Ash Bricks",
        quantity: "50000",
        unit: "pieces",
        estimatedValue: 400000,
      },
    ],
    timeline: [
      {
        id: "tl-005",
        title: "Request Submitted",
        description: "Bulk procurement request via customer app",
        date: "2026-07-10T09:00:00",
        actor: "Amit Verma",
      },
      {
        id: "tl-006",
        title: "Executive Assigned",
        description: "Vikram Singh assigned",
        date: "2026-07-11T10:00:00",
        actor: "Admin",
      },
      {
        id: "tl-007",
        title: "Quotation Sent",
        description: "Detailed quotation shared with customer",
        date: "2026-07-15T16:00:00",
        actor: "Vikram Singh",
      },
      {
        id: "tl-008",
        title: "Negotiation In Progress",
        description: "Customer requested 5% discount on steel",
        date: "2026-07-19T11:00:00",
        actor: "Vikram Singh",
      },
    ],
  },
  {
    id: "bp-004",
    company: "Urban Edge Projects",
    customerId: "cust-007",
    customerName: "Sanjay Patel",
    customerPhone: "+91 94321 09876",
    project: "GIFT City Tower B",
    projectLocation: "Gandhinagar, Gujarat",
    expectedOrderValue: 8500000,
    status: "COMPLETED",
    assignedExecutiveId: "exec-001",
    assignedExecutiveName: "Priya Sharma",
    createdAt: "2026-06-15",
    updatedAt: "2026-07-05",
    notes: "Successfully converted to order BJW-2026-000088",
    materials: [
      {
        id: "mr-010",
        material: "OPC 53 Grade Cement",
        quantity: "1200",
        unit: "bags",
        estimatedValue: 4200000,
      },
      {
        id: "mr-011",
        material: "TMT Steel Bars (12mm)",
        quantity: "50",
        unit: "MT",
        estimatedValue: 3750000,
      },
      {
        id: "mr-012",
        material: "Waterproofing Compound",
        quantity: "200",
        unit: "litres",
        estimatedValue: 550000,
      },
    ],
    timeline: [
      {
        id: "tl-009",
        title: "Request Submitted",
        description: "Bulk procurement request",
        date: "2026-06-15T08:00:00",
        actor: "Sanjay Patel",
      },
      {
        id: "tl-010",
        title: "Order Placed",
        description: "Converted to order BJW-2026-000088 worth ₹45L",
        date: "2026-07-05T15:00:00",
        actor: "Priya Sharma",
      },
    ],
  },
  {
    id: "bp-005",
    company: "Heritage Construction Co",
    customerId: "cust-006",
    customerName: "Lakshmi Narayanan",
    customerPhone: "+91 95432 10987",
    project: "Villa Township Phase 1",
    projectLocation: "OMR, Chennai",
    expectedOrderValue: 1900000,
    status: "OPEN",
    createdAt: "2026-07-21",
    updatedAt: "2026-07-21",
    notes: "New customer. First bulk order inquiry.",
    materials: [
      {
        id: "mr-013",
        material: "PPC Cement",
        quantity: "200",
        unit: "bags",
        estimatedValue: 700000,
      },
      {
        id: "mr-014",
        material: "M-Sand",
        quantity: "100",
        unit: "cubic ft",
        estimatedValue: 350000,
      },
      {
        id: "mr-015",
        material: "AAC Blocks",
        quantity: "8000",
        unit: "pieces",
        estimatedValue: 850000,
      },
    ],
    timeline: [
      {
        id: "tl-011",
        title: "Request Submitted",
        description: "First bulk procurement inquiry",
        date: "2026-07-21T07:45:00",
        actor: "Lakshmi Narayanan",
      },
    ],
  },
  {
    id: "bp-006",
    company: "Nexus Buildtech",
    customerId: "cust-009",
    customerName: "Debashish Roy",
    customerPhone: "+91 92109 87654",
    project: "IT Park Extension",
    projectLocation: "Salt Lake, Kolkata",
    expectedOrderValue: 3400000,
    status: "ASSIGNED",
    assignedExecutiveId: "exec-003",
    assignedExecutiveName: "Anita Desai",
    createdAt: "2026-07-16",
    updatedAt: "2026-07-18",
    notes: "Repeat customer. Prefers scheduled deliveries.",
    materials: [
      {
        id: "mr-016",
        material: "OPC 53 Grade Cement",
        quantity: "400",
        unit: "bags",
        estimatedValue: 1400000,
      },
      {
        id: "mr-017",
        material: "TMT Steel Bars (10mm)",
        quantity: "15",
        unit: "MT",
        estimatedValue: 1125000,
      },
      {
        id: "mr-018",
        material: "Plumbing Pipes (CPVC)",
        quantity: "500",
        unit: "pieces",
        estimatedValue: 875000,
      },
    ],
    timeline: [
      {
        id: "tl-012",
        title: "Request Submitted",
        description: "Bulk procurement for IT Park extension",
        date: "2026-07-16T13:00:00",
        actor: "Debashish Roy",
      },
      {
        id: "tl-013",
        title: "Executive Assigned",
        description: "Anita Desai assigned",
        date: "2026-07-18T10:00:00",
        actor: "Admin",
      },
    ],
  },
  {
    id: "bp-007",
    company: "Coastal Infra Ltd",
    customerId: "cust-011",
    customerName: "Thomas Mathew",
    customerPhone: "+91 90987 65432",
    project: "Port Road Widening",
    projectLocation: "Willingdon Island, Kochi",
    expectedOrderValue: 5100000,
    status: "IN_PROGRESS",
    assignedExecutiveId: "exec-002",
    assignedExecutiveName: "Vikram Singh",
    createdAt: "2026-07-08",
    updatedAt: "2026-07-17",
    notes: "Infrastructure project with phased delivery requirements.",
    materials: [
      {
        id: "mr-019",
        material: "Road Metal (40mm)",
        quantity: "500",
        unit: "cubic ft",
        estimatedValue: 1500000,
      },
      {
        id: "mr-020",
        material: "Bitumen Emulsion",
        quantity: "1000",
        unit: "litres",
        estimatedValue: 800000,
      },
      {
        id: "mr-021",
        material: "OPC 53 Grade Cement",
        quantity: "600",
        unit: "bags",
        estimatedValue: 2100000,
      },
      {
        id: "mr-022",
        material: "Geotextile Fabric",
        quantity: "2000",
        unit: "sq m",
        estimatedValue: 700000,
      },
    ],
    timeline: [
      {
        id: "tl-014",
        title: "Request Submitted",
        description: "Government infrastructure project inquiry",
        date: "2026-07-08T09:00:00",
        actor: "Thomas Mathew",
      },
      {
        id: "tl-015",
        title: "Site Survey Completed",
        description: "Material requirements verified on site",
        date: "2026-07-14T11:00:00",
        actor: "Vikram Singh",
      },
    ],
  },
  {
    id: "bp-008",
    company: "Prime Contractors LLP",
    customerId: "cust-008",
    customerName: "Suresh Meena",
    customerPhone: "+91 93210 98765",
    project: "Heritage Hotel Renovation",
    projectLocation: "Pink City, Jaipur",
    expectedOrderValue: 1200000,
    status: "CANCELLED",
    assignedExecutiveId: "exec-003",
    assignedExecutiveName: "Anita Desai",
    createdAt: "2026-06-28",
    updatedAt: "2026-07-02",
    notes: "Customer cancelled due to project delay.",
    materials: [
      {
        id: "mr-023",
        material: "Lime Mortar",
        quantity: "50",
        unit: "bags",
        estimatedValue: 250000,
      },
      {
        id: "mr-024",
        material: "Heritage Bricks",
        quantity: "15000",
        unit: "pieces",
        estimatedValue: 950000,
      },
    ],
    timeline: [
      {
        id: "tl-016",
        title: "Request Submitted",
        description: "Heritage renovation material inquiry",
        date: "2026-06-28T10:00:00",
        actor: "Suresh Meena",
      },
      {
        id: "tl-017",
        title: "Request Cancelled",
        description: "Customer cancelled due to project timeline change",
        date: "2026-07-02T14:00:00",
        actor: "Suresh Meena",
      },
    ],
  },
];

export function computeBulkProcurementStats(
  requests: BulkProcurementRequest[],
): BulkProcurementDashboardStats {
  const open = requests.filter((r) => r.status === "OPEN");
  const assigned = requests.filter(
    (r) => r.status === "ASSIGNED" || r.status === "IN_PROGRESS",
  );
  const completed = requests.filter((r) => r.status === "COMPLETED");
  const revenue = [...open, ...assigned].reduce(
    (sum, r) => sum + r.expectedOrderValue,
    0,
  );

  return {
    openRequests: open.length,
    assigned: assigned.length,
    completed: completed.length,
    revenuePotential: revenue,
  };
}
