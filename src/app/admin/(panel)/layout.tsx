import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { NavItem } from "@/components/dashboard/sidebar-nav";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth";

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Landlords", href: "/admin/hosts", icon: "users" },
  { label: "Listings", href: "/admin/listings", icon: "listings" },
  { label: "Bookings", href: "/admin/bookings", icon: "bookings" },
  { label: "Payouts", href: "/admin/payouts", icon: "payouts" },
  { label: "Messages", href: "/admin/messages", icon: "messages" },
  { label: "All admins", href: "/admin/admins", icon: "users", requiresSuperAdmin: true },
  { label: "Add admin", href: "/admin/add-admin", icon: "users", requiresSuperAdmin: true },
  { label: "Audit logs", href: "/admin/audit-logs", icon: "alerts" }
];

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      navItems={navItems}
      title="Aparte Admin"
      subtitle="Approve listings, monitor bookings, and keep payouts compliant."
      logoutHref="/admin/login"
      cookieName={ADMIN_AUTH_COOKIE}
    >
      {children}
    </DashboardShell>
  );
}
