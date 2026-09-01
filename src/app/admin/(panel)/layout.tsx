import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { NavItem } from "@/components/dashboard/sidebar-nav";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth";
import { AdminSocketWrapper } from "@/components/layout/AdminSocketWrapper";

/**
 * Grouped into four sections. Thirteen flat items had outgrown scanning —
 * finding "Caution deposits" meant reading the whole list, and the two most
 * recent additions had simply been appended wherever there was room.
 * Sections follow what an admin is doing, not what the data model calls it.
 */
const navItems: NavItem[] = [
  { label: "Overview", href: "/admin/dashboard", icon: "dashboard" },

  { label: "Landlords", href: "/admin/hosts", icon: "users", section: "Marketplace" },
  { label: "Listings", href: "/admin/listings", icon: "listings", section: "Marketplace" },
  { label: "Vehicles", href: "/admin/vehicles", icon: "vehicles", section: "Marketplace" },
  { label: "Breakfast menu", href: "/admin/breakfast", icon: "listings", section: "Marketplace" },

  { label: "Bookings", href: "/admin/bookings", icon: "bookings", section: "Operations" },
  { label: "Messages", href: "/admin/messages", icon: "messages", section: "Operations" },
  { label: "Identity", href: "/admin/identity", icon: "users", section: "Operations" },

  { label: "Payouts", href: "/admin/payouts", icon: "payouts", section: "Money" },
  { label: "Caution deposits", href: "/admin/caution-deposits", icon: "payouts", section: "Money" },

  { label: "Audit logs", href: "/admin/audit-logs", icon: "alerts", section: "Administration" },
  {
    label: "All admins",
    href: "/admin/admins",
    icon: "users",
    requiresSuperAdmin: true,
    section: "Administration",
  },
  {
    label: "Add admin",
    href: "/admin/add-admin",
    icon: "users",
    requiresSuperAdmin: true,
    section: "Administration",
  },
];

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <AdminSocketWrapper>
      <DashboardShell
        navItems={navItems}
        title="Aparte Admin"
        subtitle="Approve listings, monitor bookings, and keep payouts compliant."
        logoutHref="/admin/login"
        cookieName={ADMIN_AUTH_COOKIE}
      >
        {children}
      </DashboardShell>
    </AdminSocketWrapper>
  );
}
