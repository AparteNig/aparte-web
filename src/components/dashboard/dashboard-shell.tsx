import { SidebarNav, type NavItem } from "@/components/dashboard/sidebar-nav";
import PageFooter from "@/components/general/PageFooter";

type DashboardShellProps = {
  navItems: NavItem[];
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  logoutHref: string;
  cookieName: string;
  headerSlot?: React.ReactNode;
};

export const DashboardShell = ({
  navItems,
  title,
  subtitle,
  children,
  logoutHref,
  cookieName,
  headerSlot
}: DashboardShellProps) => (
  <div className="flex min-h-screen bg-[#F8F9FB] text-slate-900">
    <SidebarNav items={navItems} logoutHref={logoutHref} cookieName={cookieName} />
    <main className="flex w-full flex-col gap-6 px-4 py-6 md:px-10 md:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="text-base text-slate-500">{subtitle}</p>}
        {headerSlot}
      </div>
      <section className="flex-1 rounded-3xl bg-white p-6 shadow-sm">{children}</section>
      <PageFooter />
    </main>
  </div>
);
