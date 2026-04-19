"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ConversationSocketProvider } from "@/contexts/ConversationSocketContext";
import { getAuthCookie, ADMIN_AUTH_COOKIE } from "@/lib/auth";

export const AdminSocketWrapper = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    setToken(getAuthCookie(ADMIN_AUTH_COOKIE));
  }, []);
  return (
    <ConversationSocketProvider token={token}>{children}</ConversationSocketProvider>
  );
};
