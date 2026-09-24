import OwnerDashboard, { OwnerDashboardData } from "./OwnerDashboard";

// TEMPORARY UI TEST DATA - REMOVE AFTER UI VERIFICATION
const mockDashboardData: OwnerDashboardData = {
  owner: {
    name: "Alex Morgan",
    role: "Property Owner",
    membership: "Platinum Host",
    avatar: "",
  },
  financial: {
    monthlyIncome: 345000,
    occupied: 18,
    totalUnits: 20,
    available: 2,
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  },
  attention: [
    {
      id: "att-1",
      title: "Lease Expiring Soon",
      description: "Unit 304 - Sunset Heights lease ends in 14 days",
      action: "Review Lease",
      type: "warning",
    },
    {
      id: "att-2",
      title: "Maintenance Review",
      description: "Plumbing repair ticket submitted for Palm Court",
      action: "View Ticket",
      type: "normal",
    },
  ],
  requests: [
    {
      id: "req-1",
      initials: "JD",
      name: "John Doe",
      property: "Sunset Heights, Unit 204",
      status: "Pending",
    },
    {
      id: "req-2",
      initials: "SM",
      name: "Sarah Miller",
      property: "Palm Court, Villa 3B",
      status: "In Progress",
    },
    {
      id: "req-3",
      initials: "RK",
      name: "Robert King",
      property: "Ocean View, Unit 12",
      status: "Completed",
    },
  ],
  payments: [
    {
      id: "pay-1",
      initials: "JD",
      name: "John Doe",
      date: "Today, 10:30 AM",
      amount: 25000,
      status: "Paid",
    },
    {
      id: "pay-2",
      initials: "SM",
      name: "Sarah Miller",
      date: "Yesterday",
      amount: 32000,
      status: "Paid",
    },
    {
      id: "pay-3",
      initials: "RK",
      name: "Robert King",
      date: "12 Sep 2026",
      amount: 18500,
      status: "Paid",
    },
  ],
  totalProperties: 5,
};

export default function OwnerDashboardPage() {
  return <OwnerDashboard data={mockDashboardData} />;
}
