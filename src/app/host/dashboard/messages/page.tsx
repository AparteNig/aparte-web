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
    // ChatPanel renders its own header, so the page no longer repeats one —
    // there were previously two competing titles stacked above the list.
    <ChatPanel
      token={token}
      title="Guest messages"
      initialBookingId={Number.isNaN(bookingId) ? undefined : bookingId}
    />
  );
};

export default function HostMessagesPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading messages...</div>}>
      <HostMessagesContent />
    </Suspense>
  );
}
