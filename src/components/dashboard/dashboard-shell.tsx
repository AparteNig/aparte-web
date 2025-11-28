import { SidebarNav, type NavItem } from "@/components/dashboard/sidebar-nav";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  navItems: NavItem[];
  title: string;
  subtitle: string;
  children: React.ReactNode;
  logoutHref: string;
  cookieName: string;
  contentClassName?: string;
};

export const DashboardShell = ({
  navItems,
  title,
  subtitle,
  children,
  logoutHref,
  cookieName,
  contentClassName
}: DashboardShellProps) => (
  <div className="flex h-full min-h-screen">
    <SidebarNav items={navItems} title={title} logoutHref={logoutHref} cookieName={cookieName} />
    <main className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <section className={cn("space-y-4", contentClassName)}>{children}</section>
    </main>
  </div>
);
