import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { HOST_AUTH_COOKIE } from "@/lib/auth";
import { DashboardIcon, HomeIcon, NavigationIcon, MessageCenterIocn, WalletIcon } from "@/assets/icons";

const navItems = [
  { label: "Overview", href: "/host/dashboard", Icon: DashboardIcon },
  { label: "Listings", href: "/host/dashboard/listings", Icon: HomeIcon },
  { label: "Calendar", href: "/host/dashboard/calendar", Icon: NavigationIcon },
  { label: "Messages", href: "/host/dashboard/messages", Icon: MessageCenterIocn },
  { label: "Payouts", href: "/host/dashboard/payouts", Icon: WalletIcon }
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
