import type { JSX } from "react";

export type SideNavRoute = {
  label: string;
  path: string;
  activeIn: string[];
  Icon?: (props: { color?: string; color2?: string }) => JSX.Element;
};

export const sideNavRoutes: SideNavRoute[] = [];

export const Routes = {
  Dashboard: { path: "/host/dashboard" },
  Account: { path: "/host/dashboard/profile" },
};
