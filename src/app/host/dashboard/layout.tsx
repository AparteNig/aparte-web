import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { HOST_AUTH_COOKIE } from "@/lib/auth";

const navItems = [
  { label: "Overview", href: "/host/dashboard" },
  { label: "Listings", href: "/host/dashboard/listings" },
  { label: "Calendar", href: "/host/dashboard/calendar" },
  { label: "Messages", href: "/host/dashboard/messages" }
];

export default function HostDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      navItems={navItems}
      title="Host Workspace"
      subtitle="Track occupancy, revenue, and guest messages."
      logoutHref="/host/login"
      cookieName={HOST_AUTH_COOKIE}
    >
      {children}
    </DashboardShell>
  );
}
