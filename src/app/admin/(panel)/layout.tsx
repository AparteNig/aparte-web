import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth";
import {
  DashboardIcon,
  UserIcon,
  HomeIcon,
  PackageIcon,
  TickIcon,
  NotificationIcon
} from "@/assets/icons";

const navItems = [
  { label: "Overview", href: "/admin/dashboard", Icon: DashboardIcon },
  { label: "Users", href: "/admin/users", Icon: UserIcon },
  { label: "Listings", href: "/admin/listings", Icon: HomeIcon },
  { label: "Bookings", href: "/admin/bookings", Icon: PackageIcon },
  { label: "Reviews", href: "/admin/reviews", Icon: TickIcon },
  { label: "Alerts", href: "/admin/alerts", Icon: NotificationIcon }
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
