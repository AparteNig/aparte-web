"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { NavItem } from "@/components/dashboard/sidebar-nav";
import { HOST_AUTH_COOKIE } from "@/lib/auth";
import { useHostProfileQuery } from "@/hooks/use-host-profile";
import { ProfileSetupModal } from "@/components/host/profile-setup-modal";
import { HostHeaderBar } from "@/components/host/host-header-bar";
import { ResponsiveGate } from "@/components/layout/responsive-gate";

const navItems: NavItem[] = [
  { label: "Overview", href: "/host/dashboard", icon: "dashboard" },
  { label: "Listings", href: "/host/dashboard/listings", icon: "listings" },
  { label: "Calendar", href: "/host/dashboard/calendar", icon: "calendar" },
  { label: "Bookings", href: "/host/dashboard/bookings", icon: "bookings" },
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
  const needsProfileSetup = Boolean(
    data &&
      (!data.fullName ||
        !data.displayName ||
        !data.phone ||
        !data.addressLine1 ||
        !data.city ||
        !data.state ||
        !data.country ||
        !data.avatarUrl),
  );

  return (
    <ResponsiveGate>
      <ProfileSetupModal open={needsProfileSetup} profile={data} />
      <DashboardShell
        navItems={navItems}
        title={isOverview ? "Landlord Workspace" : undefined}
        subtitle={isOverview ? "Track occupancy, revenue, and guest messages." : undefined}
        logoutHref="/host/login"
        cookieName={HOST_AUTH_COOKIE}
        headerSlot={<HostHeaderBar profile={data} />}
      >
        {children}
      </DashboardShell>
    </ResponsiveGate>
  );
}
