 "use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import Button from "@/components/general/Button";
import { ADMIN_AUTH_COOKIE, clearAuthCookie } from "@/lib/auth";
import { logoutAdminRequest } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
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
  CalendarIcon,
  DriversIcon
} from "@/assets/icons";
import LandingLogo from "@/assets/landing/Logo.png";

const iconRegistry = {
  dashboard: DashboardIcon,
  listings: HomeIcon,
  vehicles: DriversIcon,
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
  requiresSuperAdmin?: boolean;
  /** Unread count. 0 or undefined renders nothing. */
  badge?: number;
  /**
   * Optional heading this item sits under. Items carrying the same section
   * render together beneath one label; items with none render exactly as
   * before, so the host sidebar is untouched by this.
   */
  section?: string;
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
  const needsAdminProfile = useMemo(() => items.some((item) => item.requiresSuperAdmin), [items]);
  const { data: adminProfile } = useAdminProfileQuery(needsAdminProfile);
  const queryClient = useQueryClient();
  const filteredItems = useMemo(() => {
    if (!needsAdminProfile) return items;
    return items.filter((item) => !item.requiresSuperAdmin || adminProfile?.isSuperAdmin);
  }, [items, needsAdminProfile, adminProfile?.isSuperAdmin]);

  const handleLogout = async () => {
    if (cookieName === ADMIN_AUTH_COOKIE) {
      try {
        await logoutAdminRequest();
      } catch {
        // ignore logout failures so users can still exit
      }
    }
    clearAuthCookie(cookieName);
    queryClient.clear();
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
          {!collapsed && (
            <Image src={LandingLogo} alt="Aparte" className="h-8 w-auto" priority />
          )}
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
          {filteredItems.map((item, index) => {
            // A heading appears only when the section changes, so grouping is
            // declared on the items themselves rather than by restructuring
            // every caller into a nested shape.
            const previous = filteredItems[index - 1];
            const startsSection =
              !collapsed && Boolean(item.section) && item.section !== previous?.section;
            const isSubPath = pathname.startsWith(`${item.href}/`);
            const isExact = pathname === item.href;
            const isActive = isExact || (item.href !== "/host/dashboard" && isSubPath);
            const IconComponent = item.icon ? iconRegistry[item.icon] : undefined;
            return (
              <div key={item.href}>
                {startsSection && (
                  <p className="px-4 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {item.section}
                  </p>
                )}
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  isActive ? "bg-[#F5F5F7] text-primary" : "hover:bg-slate-100"
                )}
              >
                {IconComponent && (
                  <span className="relative shrink-0">
                    <IconComponent
                      color={isActive ? "#00AC35" : "#1F2937"}
                      color2={isActive ? "#00AC35" : "#1F2937"}
                    />
                    {/* When collapsed there is no room for a count, so the
                        badge shrinks to a dot that still says "something is
                        waiting here". */}
                    {collapsed && Boolean(item.badge) && (
                      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                    )}
                  </span>
                )}
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && Boolean(item.badge) && (
                  <span
                    aria-label={`${item.badge} unread`}
                    className="min-w-[20px] rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[11px] font-semibold leading-4 tabular-nums text-white"
                  >
                    {item.badge! > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
              </div>
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
import { useAdminProfileQuery } from "@/hooks/admin/use-admin-data";
