import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { NavItem } from "@/components/dashboard/sidebar-nav";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth";

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin/dashboard" },
  { label: "Users", href: "/admin/dashboard/users" },
  { label: "Listings", href: "/admin/dashboard/listings" },
  { label: "Bookings", href: "/admin/dashboard/bookings" }
];

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      navItems={navItems}
      title="Admin Control Room"
      subtitle="Monitor supply, demand, and trust signals."
      logoutHref="/admin/login"
      cookieName={ADMIN_AUTH_COOKIE}
    >
      {children}
    </DashboardShell>
  );
}
