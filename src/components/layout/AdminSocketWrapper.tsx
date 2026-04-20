"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ConversationSocketProvider } from "@/contexts/ConversationSocketContext";
import { getAuthCookie, ADMIN_AUTH_COOKIE } from "@/lib/auth";
import { useDashboardEvents } from "@/hooks/use-dashboard-events";

const AdminDashboardEventsMount = () => {
  useDashboardEvents('admin');
  return null;
};

export const AdminSocketWrapper = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    setToken(getAuthCookie(ADMIN_AUTH_COOKIE));
  }, []);
  return (
    <ConversationSocketProvider token={token}>
      <AdminDashboardEventsMount />
      {children}
    </ConversationSocketProvider>
  );
};
