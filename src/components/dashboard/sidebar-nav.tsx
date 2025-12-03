 "use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import Button from "@/components/general/Button";
import { clearAuthCookie } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Logo,
  LogOutIcon,
  SideBarIcon,
  DashboardIcon,
  HomeIcon,
  NavigationIcon,
  MessageCenterIocn,
  WalletIcon,
  UserIcon,
  PackageIcon,
  TickIcon,
  NotificationIcon,
  AccountIcon,
  CalendarIcon
} from "@/assets/icons";

const iconRegistry = {
  dashboard: DashboardIcon,
  listings: HomeIcon,
  calendar: CalendarIcon,
  messages: MessageCenterIocn,
  payouts: WalletIcon,
  users: UserIcon,
  bookings: PackageIcon,
  reviews: TickIcon,
  alerts: NotificationIcon,
  profile: AccountIcon
} as const;

type IconName = keyof typeof iconRegistry;

export type NavItem = {
  label: string;
  href: string;
  icon?: IconName;
};

type SidebarNavProps = {
  items: NavItem[];
  logoutHref: string;
  cookieName: string;
};

export const SidebarNav = ({ items, logoutHref, cookieName }: SidebarNavProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);

  const handleLogout = () => {
    clearAuthCookie(cookieName);
    router.push(logoutHref);
  };

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-col justify-between border-r border-slate-200 bg-white transition-all duration-300",
        collapsed ? "w-20" : "w-72 2xl:w-80"
      )}
    >
      <div className="flex flex-col gap-6 px-4 py-6">
        <div className="flex items-center justify-between">
          {!collapsed && <Logo color="#0B1D11" color2="#00AC35" height={36} width={120} />}
          <button
            className={cn("rounded-xl p-2 hover:bg-slate-100", collapsed ? "w-full justify-center" : "")}
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label="Toggle sidebar"
          >
            <SideBarIcon />
          </button>
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const isSubPath = pathname.startsWith(`${item.href}/`);
            const isExact = pathname === item.href;
            const isActive = isExact || (item.href !== "/host/dashboard" && isSubPath);
            const IconComponent = item.icon ? iconRegistry[item.icon] : undefined;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  isActive ? "bg-[#F5F5F7] text-primary" : "hover:bg-slate-100"
                )}
              >
                {IconComponent && (
                  <IconComponent
                    color={isActive ? "#00AC35" : "#1F2937"}
                    color2={isActive ? "#00AC35" : "#1F2937"}
                  />
                )}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-col gap-4 px-4 pb-6">
        {!collapsed && (
          <div className="rounded-2xl bg-primary p-4 text-white">
            <p className="text-lg font-semibold">Need help?</p>
            <p className="mt-2 text-sm text-white/80">
              Our support team can assist with verification, payouts, or listing approvals.
            </p>
            <Button
              type="secondary"
              className="mt-4 w-full border-white/50 bg-white/20 text-white hover:bg-white/30"
            >
              Contact support
            </Button>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-500"
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
        >
          <LogOutIcon color={logoutHover ? "red" : "#1F2937"} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
};
