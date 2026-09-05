import { EnquiryStatus, TripStatus, PaymentStatus, UserRole } from "@/types/api";

/**
 * Merges CSS classes cleanly
 */
export function cn(...classes: unknown[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Formats a numeric value as Indian Rupee (INR)
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return "₹0";
  }
  const numeric = Number(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(numeric);
}

/**
 * Formats date string into readable format (e.g. 24 Aug 2026, 04:30 PM)
 */
export function formatDate(dateString: string | undefined | null, includeTime: boolean = false): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    });
  } catch {
    return "—";
  }
}

/**
 * Extracts initials from a user's name
 */
export function getInitials(name: string | undefined | null): string {
  if (!name) return "FE";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Formats role into user friendly display string
 */
export function formatRole(role: UserRole | undefined | null): string {
  switch (role) {
    case "FARMER":
      return "Farmer";
    case "TRANSPORTER":
      return "Transporter";
    case "ADMIN":
      return "Administrator";
    default:
      return "User";
  }
}

/**
 * Returns visual configurations and display labels for EnquiryStatus
 */
export function getEnquiryStatusConfig(status: EnquiryStatus): {
  label: string;
  badgeClass: string;
  dotColor: string;
} {
  switch (status) {
    case "SUBMITTED":
      return {
        label: "Submitted",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200/60",
        dotColor: "bg-amber-500",
      };
    case "ADMIN_ACCEPTED":
      return {
        label: "Admin Approved",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        dotColor: "bg-emerald-500",
      };
    case "ADMIN_REJECTED":
      return {
        label: "Admin Rejected",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200/60",
        dotColor: "bg-rose-500",
      };
    case "TRANSPORTER_ASSIGNED":
      return {
        label: "Transporter Assigned",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200/60",
        dotColor: "bg-blue-500",
      };
    case "TRANSPORTER_ACCEPTED":
      return {
        label: "Transporter Accepted",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        dotColor: "bg-emerald-500",
      };
    case "TRANSPORTER_REJECTED":
      return {
        label: "Transporter Declined",
        badgeClass: "bg-orange-50 text-orange-700 border-orange-200/60",
        dotColor: "bg-orange-500",
      };
    case "PICKUP":
      return {
        label: "Goods Picked Up",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
        dotColor: "bg-indigo-500",
      };
    case "IN_TRANSIT":
      return {
        label: "In Transit",
        badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200/60",
        dotColor: "bg-cyan-500",
      };
    case "ON_DESTINATION":
      return {
        label: "Arrived at Mandi",
        badgeClass: "bg-teal-50 text-teal-700 border-teal-200/60",
        dotColor: "bg-teal-500",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
        dotColor: "bg-emerald-600",
      };
    case "PAYMENT_COMPLETED":
      return {
        label: "Payment Completed",
        badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
        dotColor: "bg-emerald-700",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        dotColor: "bg-slate-500",
      };
    default:
      return {
        label: status,
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
        dotColor: "bg-slate-400",
      };
  }
}

/**
 * Returns visual configurations and display labels for TripStatus
 */
export function getTripStatusConfig(status: TripStatus): {
  label: string;
  badgeClass: string;
  dotColor: string;
} {
  switch (status) {
    case "ASSIGNED":
      return {
        label: "Assigned",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        dotColor: "bg-amber-500",
      };
    case "ACCEPTED":
      return {
        label: "Accepted",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotColor: "bg-emerald-500",
      };
    case "PICKUP":
      return {
        label: "Picked Up",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        dotColor: "bg-blue-500",
      };
    case "IN_TRANSIT":
      return {
        label: "In Transit",
        badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
        dotColor: "bg-cyan-500",
      };
    case "ON_DESTINATION":
      return {
        label: "At Destination",
        badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
        dotColor: "bg-teal-500",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
        dotColor: "bg-emerald-600",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        dotColor: "bg-slate-500",
      };
    default:
      return {
        label: status,
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
        dotColor: "bg-slate-400",
      };
  }
}

/**
 * Returns visual configurations and display labels for PaymentStatus
 */
export function getPaymentStatusConfig(status: PaymentStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "PAID":
      return {
        label: "Paid in Cash",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "PENDING":
      return {
        label: "Payment Pending",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "FAILED":
      return {
        label: "Payment Failed",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      };
    case "REFUNDED":
      return {
        label: "Refunded",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
      };
    default:
      return {
        label: status,
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
      };
  }
}
