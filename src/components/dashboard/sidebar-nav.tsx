"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { clearAuthCookie } from "@/lib/auth";

export type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

type SidebarNavProps = {
  items: NavItem[];
  title: string;
  logoutHref: string;
  cookieName: string;
};

export const SidebarNav = ({ items, title, logoutHref, cookieName }: SidebarNavProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuthCookie(cookieName);
    router.push(logoutHref);
  };

  return (
    <aside className="flex h-full flex-col gap-4 border-r bg-muted/40 p-4">
      <div>
        <p className="text-xs uppercase text-muted-foreground">{title}</p>
      </div>
      <nav className="space-y-1 flex-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
              pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      <Button variant="ghost" className="justify-start text-sm" onClick={handleLogout}>
        Logout
      </Button>
    </aside>
  );
};
