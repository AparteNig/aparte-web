"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState
} from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import Button from "@/components/general/Button";
import { Input } from "@/components/ui/input";
import { getIdentityFromToken } from "@/lib/token-utils";
import {
  useConversationSocketContext,
  type MessageNew
} from "@/contexts/ConversationSocketContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://humble-liberation-staging.up.railway.app";

type MessageRow = {
  id: number;
  localId?: string;
  author: string;
  body: string | null;
  createdAt?: string;
  mediaUrl?: string;
  mediaKey?: string;
  deliveryStatus?: "sending" | "sent";
};

type ConversationSummary = {
  id: number;
  bookingId: number | null;
  hostId: number | null;
  userId: number | null;
  adminId: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string | null;
  bookingStartDate?: string | null;
  bookingEndDate?: string | null;
  guestName?: string | null;
  listingTitle?: string | null;
  listingCity?: string | null;
  listingCountry?: string | null;
  hostName?: string | null;
  hostDisplayName?: string | null;
  hostEmail?: string | null;
  hostAvatarUrl?: string | null;
  userEmail?: string | null;
};

type ChatPanelProps = {
  token: string | null;
  title: string;
  allowAdminDirect?: boolean;
  initialBookingId?: number;
};

const buildUrl = (path: string) =>
  path.startsWith("http") ? path : `${API_BASE_URL.replace(/\/$/, "")}${path}`;

const fetchWithAuth = async <T,>(
  path: string,
  token: string,
  options: RequestInit = {}
) => {
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`
    }
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? (payload as { message: string }).message
        : "Request failed";
    throw new Error(message);
  }
  return payload as T;
};

type BookingOption = {
  id: number;
  status: string;
  guestName: string | null;
  startDate: string;
  endDate: string;
  listing: { title: string; city: string; country: string };
};

const MESSAGEABLE_STATUSES = new Set(["confirmed", "ongoing", "checkout_due", "guest_departed"]);

type ApiMessage = {
  id: number;
  conversationId: number;
  senderType: string;
  senderId: number;
  body: string | null;
  mediaKey?: string | null;
  createdAt: string;
};

type MessageLike = {
  id: number;
  senderType: string;
  senderId: number;
  body: string | null;
  mediaKey?: string | null;
  createdAt: string;
};

const messageToRow = async (m: MessageLike, token: string | null): Promise<MessageRow> => {
  const author = `${m.senderType}_${m.senderId}`;
  let mediaUrl: string | undefined;
  if (m.mediaKey && token) {
    try {
      const signed = await fetchWithAuth<{ url: string }>(
        `/uploads/signed-url?key=${encodeURIComponent(m.mediaKey)}`,
        token,
        { method: "GET" }
      );
      mediaUrl = signed.url;
    } catch { /* ignore — will refresh on image error */ }
  }
  return { id: m.id, author, body: m.body, createdAt: m.createdAt, mediaUrl, mediaKey: m.mediaKey ?? undefined, deliveryStatus: "sent" };
};

export default function ChatPanel({
  token,
  title,
  allowAdminDirect,
  initialBookingId
}: ChatPanelProps) {
  const [bookingId, setBookingId] = useState("");
  const [hostId, setHostId] = useState("");
  const [userId, setUserId] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [showList, setShowList] = useState(true);
  const [message, setMessage] = useState("");
  const [mediaUploading, setMediaUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeMessages, setRealtimeMessages] = useState<MessageRow[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const conversationIdRef = useRef<number | null>(null);

  const identity = token ? getIdentityFromToken(token) : null;
  const entityType = (identity?.split("_")[0] ?? null) as "user" | "host" | "admin" | null;
  const { socket, sendMessage: socketSend, markRead, joinRoom } = useConversationSocketContext();

  const conversationsQuery = useQuery<ConversationSummary[]>({
    queryKey: ["conversations", token],
    queryFn: async () => {
      if (!token) return [];
      const data = await fetchWithAuth<{ conversations: ConversationSummary[] }>(
        "/conversations",
        token,
        { method: "GET" }
      );
      return data.conversations;
    },
    enabled: Boolean(token),
    staleTime: 1000 * 30
  });

  const bookingsQuery = useQuery<BookingOption[]>({
    queryKey: ["bookings-for-chat", token, entityType],
    queryFn: async () => {
      if (!token || entityType === "admin" || !entityType) return [];
      const endpoint = entityType === "host" ? "/hosts/bookings" : "/customer/bookings";
      const data = await fetchWithAuth<{ bookings: BookingOption[] }>(endpoint, token, { method: "GET" });
      return data.bookings.filter((b) => MESSAGEABLE_STATUSES.has(b.status));
    },
    enabled: Boolean(token) && entityType !== "admin",
    staleTime: 1000 * 60
  });

  // Load initial messages when conversation opens
  useEffect(() => {
    if (conversationId === null || !token) return;
    let cancelled = false;
    setMessagesLoading(true);
    setRealtimeMessages([]);
    fetchWithAuth<{ messages: ApiMessage[]; hasMore: boolean }>(
      `/conversations/${conversationId}/messages?limit=50`,
      token,
      { method: "GET" }
    )
      .then(async (data) => {
        if (cancelled) return;
        const rows = await Promise.all(data.messages.map((m) => messageToRow(m, token)));
        if (!cancelled) {
          setRealtimeMessages(rows);
          setHasMore(data.hasMore);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load messages.");
      })
      .finally(() => { if (!cancelled) setMessagesLoading(false); });
    return () => { cancelled = true; };
  }, [conversationId, token]);

  // Subscribe to real-time messages from socket
  useEffect(() => {
    if (!socket || conversationId === null) return;
    const handler = async (msg: MessageNew) => {
      if (msg.conversationId !== conversationId) return;
      const row = await messageToRow(msg, token);
      setRealtimeMessages((prev) => {
        if (prev.some((item) => item.id === msg.id && item.id !== 0)) return prev;
        const optimistic = prev.find(
          (item) =>
            item.localId &&
            item.deliveryStatus === "sending" &&
            item.author === `${msg.senderType}_${msg.senderId}` &&
            (item.body === msg.body || (item.mediaKey && item.mediaKey === msg.mediaKey))
        );
        if (optimistic) {
          return prev.map((item) =>
            item.localId === optimistic.localId ? { ...row, localId: item.localId } : item
          );
        }
        return [...prev, row];
      });
    };
    socket.on("message:new", handler);
    return () => { socket.off("message:new", handler); };
  }, [socket, conversationId, token]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (conversationId !== null) markRead(conversationId);
  }, [conversationId, markRead]);

  // Keep conversationIdRef in sync for async cancellation guards
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [realtimeMessages.length, conversationId]);

  const openByBookingMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error("Missing auth token");
      return fetchWithAuth<{ id: number }>(`/conversations/booking/${id}`, token, { method: "POST" });
    },
    onSuccess: (payload) => {
      setConversationId(payload.id);
      setShowList(false);
      setError(null);
      joinRoom(payload.id);
      conversationsQuery.refetch();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to open conversation.");
    }
  });

  // Auto-open from URL param — must be after openByBookingMutation declaration
  useEffect(() => {
    if (!initialBookingId || !token) return;
    openByBookingMutation.mutate(String(initialBookingId));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBookingId, token]);

  const loadOlderMessages = async () => {
    if (!token || conversationId === null || !hasMore || loadingOlder) return;
    const oldest = realtimeMessages[0];
    if (!oldest) return;
    const loadingForId = conversationId;
    setLoadingOlder(true);
    try {
      const data = await fetchWithAuth<{ messages: ApiMessage[]; hasMore: boolean }>(
        `/conversations/${loadingForId}/messages?before=${oldest.id}&limit=50`,
        token,
        { method: "GET" }
      );
      // Guard: conversation changed while loading
      if (conversationIdRef.current !== loadingForId) return;
      const rows = await Promise.all(data.messages.map((m) => messageToRow(m, token)));
      if (conversationIdRef.current !== loadingForId) return;
      setRealtimeMessages((prev) => [...rows, ...prev]);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load older messages.");
    } finally {
      setLoadingOlder(false);
    }
  };

  const openAdminMutation = useMutation({
    mutationFn: async (payload: { hostId?: number; userId?: number }) => {
      if (!token) throw new Error("Missing auth token");
      return fetchWithAuth<{ id: number }>("/conversations", token, {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },
    onSuccess: (payload) => {
      setConversationId(payload.id);
      setShowList(false);
      setError(null);
      joinRoom(payload.id);
      conversationsQuery.refetch();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to open conversation.");
    }
  });

  const joinConversationMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!token) throw new Error("Missing auth token");
      await fetchWithAuth<{ status: string }>(`/conversations/${id}/join`, token, { method: "POST" });
      return id;
    },
    onSuccess: (id) => {
      joinRoom(id);
      conversationsQuery.refetch();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to join conversation.");
    }
  });

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!identity) { setError("Missing identity."); return; }
    const trimmed = message.trim();
    if (!trimmed) { setError("Message cannot be empty."); return; }
    if (conversationId === null) { setError("No conversation selected."); return; }
    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimistic: MessageRow = {
      id: 0,
      localId,
      author: identity,
      body: trimmed,
      createdAt: new Date().toISOString(),
      deliveryStatus: "sending"
    };
    setRealtimeMessages((prev) => [...prev, optimistic]);
    setMessage("");
    socketSend(conversationId, trimmed)
      .then((ack) => {
        setRealtimeMessages((prev) =>
          prev.map((item) =>
            item.localId === localId
              ? { ...item, id: ack.id, deliveryStatus: "sent" as const }
              : item
          )
        );
        conversationsQuery.refetch();
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to send message.");
      });
  };

  const handleSendMedia = async (file: File) => {
    if (!identity || conversationId === null || !token) return;
    if (file.size > 10 * 1024 * 1024) { setError("File too large. Max size is 10MB."); return; }
    setError(null);
    setMediaUploading(true);
    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const previewUrl = URL.createObjectURL(file);
    setRealtimeMessages((prev) => [
      ...prev,
      { id: 0, localId, author: identity, body: null, createdAt: new Date().toISOString(), deliveryStatus: "sending", mediaUrl: previewUrl }
    ]);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "chat");
      formData.append("entityId", String(conversationId));
      const response = await fetch(buildUrl("/uploads"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const uploadPayload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          uploadPayload && typeof uploadPayload === "object" && "message" in uploadPayload
            ? (uploadPayload as { message: string }).message
            : "Upload failed"
        );
      }
      const key = (uploadPayload as { key?: string }).key;
      if (!key) throw new Error("Upload failed.");
      const ack = await socketSend(conversationId, null, key);
      setRealtimeMessages((prev) =>
        prev.map((item) =>
          item.localId === localId
            ? { ...item, id: ack.id, mediaKey: key, deliveryStatus: "sent" as const }
            : item
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send image.");
    } finally {
      setMediaUploading(false);
    }
  };

  const refreshMediaUrl = async (msg: MessageRow) => {
    if (!msg.mediaKey || !token) return;
    try {
      const signed = await fetchWithAuth<{ url: string }>(
        `/uploads/signed-url?key=${encodeURIComponent(msg.mediaKey)}`,
        token,
        { method: "GET" }
      );
      setRealtimeMessages((prev) =>
        prev.map((item) => {
          const matches = msg.id !== 0 ? item.id === msg.id : item.localId === msg.localId;
          return matches ? { ...item, mediaUrl: signed.url } : item;
        })
      );
    } catch { /* ignore */ }
  };

  const handleMediaChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleSendMedia(file);
    if (mediaInputRef.current) mediaInputRef.current.value = "";
  };

  const handleOpenBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!bookingId) { setError("Booking ID is required."); return; }
    openByBookingMutation.mutate(bookingId);
  };

  const handleOpenAdmin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!hostId && !userId) { setError("Provide either a host ID or user ID."); return; }
    if (hostId && userId) { setError("Provide only one: host ID or user ID."); return; }
    openAdminMutation.mutate({
      hostId: hostId ? Number(hostId) : undefined,
      userId: userId ? Number(userId) : undefined
    });
  };

  const isOwnMessage = (author?: string) => Boolean(identity && author === identity);
  const getHostIdentity = (hId?: number | null) => (hId ? `host_${hId}` : null);
  const getInitials = (value?: string | null) => {
    if (!value) return "?";
    const parts = value.trim().split(/\s+/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
  };

  const activeConversation = conversationsQuery.data?.find((c) => c.id === conversationId);
  const hostDisplayName =
    activeConversation?.hostDisplayName ?? activeConversation?.hostName ?? activeConversation?.hostEmail ?? "Host";
  const guestDisplayName = activeConversation?.guestName ?? activeConversation?.userEmail ?? "Guest";
  const hostAvatarUrl = activeConversation?.hostAvatarUrl ?? null;
  const hostIdentity = getHostIdentity(activeConversation?.hostId ?? null);
  const isAdminMember = Boolean(activeConversation?.adminId);

  const getAuthorLabel = (author?: string) => {
    if (!author) return "Unknown";
    if (identity && author === identity) return "You";
    if (hostIdentity && author === hostIdentity) return hostDisplayName;
    if (author.startsWith("user_")) return guestDisplayName;
    if (author.startsWith("admin_")) return "Admin";
    return author;
  };

  return (
    <div className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">
            Open a booking conversation and send messages in real time.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          {conversationsQuery.data?.length ?? 0} conversations
        </div>
      </div>

      {!token ? (
        <p className="text-sm text-slate-500">Sign in to load conversations.</p>
      ) : (
        <div className={conversationId && !showList ? "grid gap-6" : "grid gap-6 lg:grid-cols-[320px_1fr]"}>
          {(!conversationId || showList) && (
            <div className="space-y-4 rounded-3xl border border-emerald-100 bg-emerald-50/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-emerald-900">Your conversations</p>
                <Button
                  type="secondary"
                  className="rounded-2xl border-emerald-100 bg-white px-4 py-2 text-xs text-emerald-900"
                  onClick={() => conversationsQuery.refetch()}
                >
                  Refresh
                </Button>
              </div>

              {conversationsQuery.isLoading ? (
                <p className="text-sm text-slate-500">Loading conversations...</p>
              ) : conversationsQuery.data && conversationsQuery.data.length > 0 ? (
                <div className="space-y-2">
                  {conversationsQuery.data.map((conversation) => {
                    const isActive = conversation.id === conversationId;
                    const bookingLabel = conversation.bookingId
                      ? `Booking #${conversation.bookingId}`
                      : `Conversation #${conversation.id}`;
                    const listingLine = conversation.listingTitle
                      ? `${conversation.listingTitle} · ${conversation.listingCity ?? ""} ${conversation.listingCountry ?? ""}`.trim()
                      : null;
                    const dateLine =
                      conversation.bookingStartDate && conversation.bookingEndDate
                        ? `${new Date(conversation.bookingStartDate).toLocaleDateString()} – ${new Date(conversation.bookingEndDate).toLocaleDateString()}`
                        : null;
                    const subtitleLine = conversation.guestName
                      ? `Guest ${conversation.guestName}`
                      : conversation.userEmail
                        ? `Guest ${conversation.userEmail}`
                        : conversation.hostDisplayName
                          ? `Host ${conversation.hostDisplayName}`
                          : conversation.hostName
                            ? `Host ${conversation.hostName}`
                            : conversation.hostEmail
                              ? `Host ${conversation.hostEmail}`
                              : null;
                    const lastMessageTime = conversation.lastMessageAt
                      ? new Date(conversation.lastMessageAt).toLocaleString()
                      : conversation.updatedAt
                        ? new Date(conversation.updatedAt).toLocaleString()
                        : null;
                    const hostLabel =
                      conversation.hostDisplayName ?? conversation.hostName ?? conversation.hostEmail ?? "Host";
                    return (
                      <button
                        type="button"
                        key={conversation.id}
                        onClick={() => {
                          setConversationId(conversation.id);
                          setShowList(false);
                        }}
                        className={`w-full rounded-2xl border p-3 text-left text-sm transition ${
                          isActive
                            ? "border-emerald-400 bg-white shadow-sm"
                            : "border-emerald-100 bg-white hover:border-emerald-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            {conversation.hostAvatarUrl ? (
                              <img
                                src={conversation.hostAvatarUrl}
                                alt={hostLabel}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
                                {getInitials(hostLabel)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{bookingLabel}</p>
                              {subtitleLine && <p className="text-xs text-slate-500">{subtitleLine}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {lastMessageTime && (
                              <span className="text-[11px] text-slate-400">{lastMessageTime}</span>
                            )}
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">
                              {conversation.status}
                            </span>
                          </div>
                        </div>
                        {listingLine && <p className="mt-1 text-xs text-slate-500">{listingLine}</p>}
                        {dateLine && <p className="text-xs text-slate-400">{dateLine}</p>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No conversations yet.</p>
              )}

              {entityType !== "admin" && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {entityType === "host" ? "Your bookings" : "My bookings"}
                  </p>
                  {bookingsQuery.isLoading ? (
                    <p className="text-xs text-slate-400">Loading bookings…</p>
                  ) : bookingsQuery.data && bookingsQuery.data.length > 0 ? (
                    <div className="space-y-1.5">
                      {bookingsQuery.data.map((booking) => {
                        const dateRange = `${new Date(booking.startDate).toLocaleDateString()} – ${new Date(booking.endDate).toLocaleDateString()}`;
                        const label = booking.listing.title;
                        const sub = booking.guestName
                          ? `Guest: ${booking.guestName}`
                          : `${booking.listing.city}`;
                        const isPending = openByBookingMutation.isPending && bookingId === String(booking.id);
                        return (
                          <button
                            key={booking.id}
                            type="button"
                            disabled={openByBookingMutation.isPending}
                            onClick={() => {
                              setBookingId(String(booking.id));
                              openByBookingMutation.mutate(String(booking.id));
                            }}
                            className="w-full rounded-2xl border border-emerald-100 bg-white p-3 text-left text-sm transition hover:border-emerald-300 hover:shadow-sm disabled:opacity-60"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-slate-800 truncate">{label}</p>
                              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                                {booking.status.replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{sub}</p>
                            <p className="text-[11px] text-slate-400">{dateRange}</p>
                            {isPending && <p className="text-[11px] text-emerald-600">Opening…</p>}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No active bookings.</p>
                  )}
                </div>
              )}

              {allowAdminDirect && (
                <form
                  className="grid gap-3 rounded-2xl border border-emerald-100 bg-white p-3"
                  onSubmit={handleOpenAdmin}
                >
                  <label className="text-sm font-medium text-slate-600">
                    Host ID
                    <Input
                      className="mt-1 rounded-2xl border-emerald-100 focus-visible:ring-emerald-200"
                      placeholder="host id"
                      value={hostId}
                      onChange={(e) => setHostId(e.target.value)}
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    User ID
                    <Input
                      className="mt-1 rounded-2xl border-emerald-100 focus-visible:ring-emerald-200"
                      placeholder="user id"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </label>
                  <Button
                    type="secondary"
                    className="rounded-2xl border-emerald-100 bg-emerald-50 px-5 text-emerald-900"
                    buttonType="submit"
                    disabled={openAdminMutation.isPending}
                  >
                    {openAdminMutation.isPending ? "Opening..." : "Open direct chat"}
                  </Button>
                </form>
              )}
            </div>
          )}

          <div className="rounded-3xl border border-emerald-100 bg-[#efeae2] p-0 shadow-inner">
            {conversationId ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 bg-white/90 px-5 py-4 backdrop-blur">
                  <div className="flex items-center gap-3">
                    {hostAvatarUrl ? (
                      <img
                        src={hostAvatarUrl}
                        alt={hostDisplayName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
                        {getInitials(hostDisplayName)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{hostDisplayName}</p>
                      <p className="text-xs text-slate-500">ID: {conversationId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{realtimeMessages.length} messages</span>
                    {allowAdminDirect && !isAdminMember && (
                      <Button
                        type="secondary"
                        className="rounded-2xl border-emerald-100 bg-white px-3 py-2 text-xs text-emerald-900"
                        disabled={joinConversationMutation.isPending}
                        onClick={() => joinConversationMutation.mutate(conversationId)}
                      >
                        {joinConversationMutation.isPending ? "Joining..." : "Join conversation"}
                      </Button>
                    )}
                    <Button
                      type="secondary"
                      className="rounded-2xl border-emerald-100 bg-white px-3 py-2 text-xs text-emerald-900"
                      onClick={() => setShowList(true)}
                    >
                      Back to list
                    </Button>
                  </div>
                </div>

                <div
                  className="max-h-[520px] space-y-3 overflow-y-auto px-5 py-6 text-sm"
                  onScroll={(e) => {
                    if ((e.currentTarget as HTMLDivElement).scrollTop === 0) {
                      loadOlderMessages();
                    }
                  }}
                >
                  {loadingOlder && (
                    <p className="text-center text-xs text-slate-400">Loading older messages...</p>
                  )}
                  {hasMore && !loadingOlder && (
                    <button
                      type="button"
                      className="w-full text-center text-xs text-emerald-600 hover:underline"
                      onClick={loadOlderMessages}
                    >
                      Load older messages
                    </button>
                  )}
                  {messagesLoading ? (
                    <p className="text-slate-500">Loading messages...</p>
                  ) : realtimeMessages.length > 0 ? (
                    realtimeMessages.map((msg) => {
                      const showHostAvatar = Boolean(
                        hostIdentity && msg.author === hostIdentity && !isOwnMessage(msg.author)
                      );
                      return (
                        <div
                          key={msg.localId ?? msg.id}
                          className={`flex ${isOwnMessage(msg.author) ? "justify-end" : "justify-start"}`}
                        >
                          {!isOwnMessage(msg.author) && (
                            <div className="mr-2 mt-1">
                              {showHostAvatar && hostAvatarUrl ? (
                                <img
                                  src={hostAvatarUrl}
                                  alt={hostDisplayName}
                                  className="h-7 w-7 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-800">
                                  {showHostAvatar ? getInitials(hostDisplayName) : "—"}
                                </div>
                              )}
                            </div>
                          )}
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                              isOwnMessage(msg.author)
                                ? "bg-emerald-600 text-white"
                                : "bg-white text-slate-900"
                            }`}
                          >
                            <p className="text-[11px] font-semibold opacity-70">
                              {getAuthorLabel(msg.author)}
                            </p>
                            {msg.mediaUrl && (
                              <div className="mt-2 overflow-hidden rounded-xl">
                                <img
                                  src={msg.mediaUrl}
                                  alt="Shared image"
                                  className="h-auto w-64 max-w-full rounded-xl object-cover"
                                  onError={() => refreshMediaUrl(msg)}
                                />
                              </div>
                            )}
                            {msg.body && <p className="text-sm">{msg.body}</p>}
                            {msg.createdAt && (
                              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                                <span>{new Date(msg.createdAt).toLocaleString()}</span>
                                {isOwnMessage(msg.author) && renderDeliveryStatus(msg.deliveryStatus)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-500">No messages yet.</p>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  className="flex flex-col gap-3 border-t border-emerald-100 bg-white/90 px-5 py-4 md:flex-row"
                  onSubmit={handleSendMessage}
                >
                  <input
                    ref={mediaInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMediaChange}
                  />
                  <Button
                    type="secondary"
                    className="rounded-full border-emerald-100 bg-white px-4 py-2 text-xs text-emerald-900"
                    disabled={mediaUploading}
                    onClick={() => mediaInputRef.current?.click()}
                  >
                    {mediaUploading ? "Uploading..." : "Add image"}
                  </Button>
                  <Input
                    className="flex-1 rounded-full border-emerald-100 bg-white px-4 py-2 focus-visible:ring-emerald-200"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button
                    type="primary"
                    className="rounded-full bg-emerald-600 px-6 text-white hover:bg-emerald-700"
                    buttonType="submit"
                    disabled={!message.trim()}
                  >
                    Send
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-16 text-center text-sm text-slate-500">
                <p className="text-base font-semibold text-slate-700">Select a conversation</p>
                <p>Pick a chat on the left or open a booking.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

const renderDeliveryStatus = (status?: MessageRow["deliveryStatus"]) => {
  if (!status || status === "sending") {
    return (
      <span className="inline-flex h-3 w-3 items-center justify-center">
        <svg viewBox="0 0 16 16" className="h-3 w-3 text-current">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 4.5v3.8l2.6 1.7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  return (
    <span className="inline-flex h-3 w-3 items-center justify-center text-white/80">
      <svg viewBox="0 0 16 16" className="h-3 w-3">
        <path
          d="M2.5 8.5l3 3.2 7-7.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};
