"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { HOST_AUTH_COOKIE } from "@/lib/auth";
import { useHostProfileQuery } from "@/hooks/use-host-profile";
import { HostHeaderBar } from "@/components/host/host-header-bar";

const navItems = [
  { label: "Overview", href: "/host/dashboard", icon: "dashboard" },
  { label: "Listings", href: "/host/dashboard/listings", icon: "listings" },
  { label: "Calendar", href: "/host/dashboard/calendar", icon: "calendar" },
  { label: "Messages", href: "/host/dashboard/messages", icon: "messages" },
  { label: "Payouts", href: "/host/dashboard/payouts", icon: "payouts" },
  { label: "Profile", href: "/host/dashboard/profile", icon: "profile" },
];

export default function HostDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data } = useHostProfileQuery();
  const pathname = usePathname();
  const isOverview = pathname === "/host/dashboard";

  return (
    <DashboardShell
      navItems={navItems}
      title={isOverview ? "Host Workspace" : undefined}
      subtitle={isOverview ? "Track occupancy, revenue, and guest messages." : undefined}
      logoutHref="/host/login"
      cookieName={HOST_AUTH_COOKIE}
      headerSlot={<HostHeaderBar profile={data} />}
    >
      {children}
    </DashboardShell>
  );
}
