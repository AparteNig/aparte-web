"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import ChatPanel from "@/components/messaging/chat-panel";
import { getAuthCookie, ADMIN_AUTH_COOKIE } from "@/lib/auth";

export default function AdminMessagesPage() {
  const [token, setToken] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get("bookingId");
  const bookingId = bookingIdParam ? Number(bookingIdParam) : undefined;

  useEffect(() => {
    setToken(getAuthCookie(ADMIN_AUTH_COOKIE));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Messages</h2>
      <p className="text-slate-600">Jump into booking chats or open direct support threads.</p>
      <ChatPanel
        token={token}
        title="Admin messaging workspace"
        allowAdminDirect
        initialBookingId={Number.isNaN(bookingId) ? undefined : bookingId}
      />
    </div>
  );
}
