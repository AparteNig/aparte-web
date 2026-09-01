"use client";

import { useMemo, useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { NavItem } from "@/components/dashboard/sidebar-nav";
import { getAuthCookie, HOST_AUTH_COOKIE } from "@/lib/auth";
import { ConversationSocketProvider } from "@/contexts/ConversationSocketContext";
import { useHostProfileQuery } from "@/hooks/use-host-profile";
import { ProfileSetupModal } from "@/components/host/profile-setup-modal";
import { HostHeaderBar } from "@/components/host/host-header-bar";
import { ResponsiveGate } from "@/components/layout/responsive-gate";
import { useDashboardEvents } from "@/hooks/use-dashboard-events";
import { useUnreadMessages } from "@/hooks/use-unread-messages";

const HostDashboardEventsBridge = () => {
  useDashboardEvents('host');
  return null;
};

/**
 * Lives inside ConversationSocketProvider so the badge can react to live
 * message events — the provider is mounted by the layout below, so this had to
 * be a child component rather than a hook call in the layout itself.
 */
const HostNav = ({ token, children }: { token: string | null; children: (items: NavItem[]) => ReactNode }) => {
  const { total } = useUnreadMessages(token);
  const items = useMemo(
    () =>
      navItems.map((item) =>
        item.href === "/host/dashboard/messages" ? { ...item, badge: total } : item,
      ),
    [total],
  );
  return <>{children(items)}</>;
};

const navItems: NavItem[] = [
  { label: "Overview", href: "/host/dashboard", icon: "dashboard" },
  { label: "Listings", href: "/host/dashboard/listings", icon: "listings" },
  { label: "Vehicles", href: "/host/dashboard/vehicles", icon: "vehicles" },
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
  const [socketToken, setSocketToken] = useState<string | null>(null);
  useEffect(() => {
    setSocketToken(getAuthCookie(HOST_AUTH_COOKIE));
  }, []);
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
    <ConversationSocketProvider token={socketToken}>
      <HostDashboardEventsBridge />
      <ResponsiveGate>
        <ProfileSetupModal open={needsProfileSetup} profile={data} />
        <HostNav token={socketToken}>
          {(items) => (
            <DashboardShell
              navItems={items}
              title={isOverview ? "Landlord Workspace" : undefined}
              subtitle={isOverview ? "Track occupancy, revenue, and guest messages." : undefined}
              logoutHref="/host/login"
              cookieName={HOST_AUTH_COOKIE}
              headerSlot={<HostHeaderBar profile={data} />}
            >
              {children}
            </DashboardShell>
          )}
        </HostNav>
      </ResponsiveGate>
    </ConversationSocketProvider>
  );
}
