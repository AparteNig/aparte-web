"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import ChatPanel from "@/components/messaging/chat-panel";
import { getAuthCookie, HOST_AUTH_COOKIE } from "@/lib/auth";

const HostMessagesContent = () => {
  const [token, setToken] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get("bookingId");
  const bookingId = bookingIdParam ? Number(bookingIdParam) : undefined;

  useEffect(() => {
    setToken(getAuthCookie(HOST_AUTH_COOKIE));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Guest messages</h2>
      <p className="text-slate-600">Reply quickly and keep response times high.</p>
      <ChatPanel
        token={token}
        title="Host messaging workspace"
        initialBookingId={Number.isNaN(bookingId) ? undefined : bookingId}
      />
    </div>
  );
};

export default function HostMessagesPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading messages...</div>}>
      <HostMessagesContent />
    </Suspense>
  );
}
