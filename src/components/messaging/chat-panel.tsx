"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Client as ConversationsClient, Conversation, Message } from "@twilio/conversations";
import { Client } from "@twilio/conversations";

import Button from "@/components/general/Button";
import { Input } from "@/components/ui/input";
import { getIdentityFromToken } from "@/lib/token-utils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://humble-liberation-staging.up.railway.app";

type MessageRow = {
  sid: string;
  author: string;
  body: string;
  dateCreated?: string;
  localId?: string;
  deliveryStatus?: "sending" | "sent" | "delivered" | "read";
};

type ConversationSummary = {
  id: number;
  twilioSid: string;
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

const fetchWithAuth = async <T,>(path: string, token: string, options: RequestInit = {}) => {
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
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

export default function ChatPanel({
  token,
  title,
  allowAdminDirect,
  initialBookingId
}: ChatPanelProps) {
  const [bookingId, setBookingId] = useState("");
  const [hostId, setHostId] = useState("");
  const [userId, setUserId] = useState("");
  const [conversationSid, setConversationSid] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [showList, setShowList] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [realtimeMessages, setRealtimeMessages] = useState<MessageRow[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [connectionState, setConnectionState] = useState<string>("disconnected");
  const clientRef = useRef<ConversationsClient | null>(null);
  const conversationRef = useRef<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const reconnectingRef = useRef(false);

  const identity = useMemo(() => (token ? getIdentityFromToken(token) : null), [token]);

  const conversationsQuery = useQuery<ConversationSummary[]>({
    queryKey: ["conversations", token],
    queryFn: async () => {
      if (!token) return [];
      const data = await fetchWithAuth<{ conversations: ConversationSummary[] }>(
        "/conversations",
        token,
        { method: "GET" },
      );
      return data.conversations;
    },
    enabled: Boolean(token),
    staleTime: 1000 * 30,
  });
  
  const fetchTwilioToken = async () => {
    if (!token) throw new Error("Missing auth token");
    const response = await fetchWithAuth<{ token: string }>(
      "/conversations/token",
      token,
      { method: "POST" },
    );
    return response.token;
  };

  const initTwilioClient = async (twilioToken: string) => {
    if (clientRef.current) {
      clientRef.current.removeAllListeners();
      clientRef.current.shutdown();
    }
    const client = new Client(twilioToken);
    clientRef.current = client;
    client.on("stateChanged", (state) => {
      if (state === "failed") {
        setError("Failed to initialize chat.");
      }
    });
    client.on("connectionStateChanged", (state) => {
      setConnectionState(state);
    });
    client.on("tokenAboutToExpire", async () => {
      try {
        const refreshed = await fetchTwilioToken();
        await client.updateToken(refreshed);
      } catch (err) {
        console.error("[chat] token refresh failed", err);
      }
    });
    client.on("tokenExpired", async () => {
      try {
        const refreshed = await fetchTwilioToken();
        await initTwilioClient(refreshed);
      } catch (err) {
        console.error("[chat] token expired refresh failed", err);
      }
    });
  };

  const refreshTwilioClient = async () => {
    if (reconnectingRef.current) return;
    reconnectingRef.current = true;
    try {
      const twilioToken = await fetchTwilioToken();
      if (!clientRef.current) {
        await initTwilioClient(twilioToken);
      } else {
        try {
          await clientRef.current.updateToken(twilioToken);
        } catch (err) {
          console.error("[chat] token update failed, reinitializing", err);
          await initTwilioClient(twilioToken);
        }
      }
      if (conversationSid && clientRef.current) {
        try {
          conversationRef.current = await clientRef.current.getConversationBySid(conversationSid);
        } catch (err) {
          console.error("[chat] reload conversation failed", err);
        }
      }
    } finally {
      reconnectingRef.current = false;
    }
  };

  useEffect(() => {
    let cancelled = false;
    const initClient = async () => {
      if (!token) return;
      try {
        const twilioToken = await fetchTwilioToken();
        if (cancelled) return;
        await initTwilioClient(twilioToken);
      } catch (err) {
        console.error("[chat] init client failed", err);
        setError(err instanceof Error ? err.message : "Failed to initialize chat.");
      }
    };

    initClient();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let active = true;
    const loadConversation = async () => {
      if (!conversationSid || !clientRef.current) return;
      setMessagesLoading(true);
      try {
        const conversation = await clientRef.current.getConversationBySid(conversationSid);
        if (!active) return;
        if (conversationRef.current) {
          conversationRef.current.removeAllListeners("messageAdded");
        }
        conversationRef.current = conversation;
        const messages = await conversation.getMessages(50);
        if (!active) return;
        setRealtimeMessages(
          messages.items.map((msg) => ({
            sid: msg.sid,
            author: msg.author ?? "",
            body: msg.body ?? "",
            dateCreated: msg.dateCreated?.toISOString(),
            deliveryStatus: "sent",
          })),
        );
        conversation.on("messageAdded", (msg: Message) => {
          setRealtimeMessages((prev) => {
            if (prev.some((item) => item.sid === msg.sid)) {
              return prev;
            }
            const optimisticMatch = prev.find(
              (item) =>
                item.localId &&
                item.deliveryStatus === "sending" &&
                item.author === (msg.author ?? "") &&
                item.body === (msg.body ?? "")
            );
            if (optimisticMatch) {
              return prev.map((item) =>
                item.localId === optimisticMatch.localId
                  ? {
                      ...item,
                      sid: msg.sid,
                      dateCreated: msg.dateCreated?.toISOString(),
                      deliveryStatus: "sent",
                    }
                  : item,
              );
            }
            return [
              ...prev,
              {
                sid: msg.sid,
                author: msg.author ?? "",
                body: msg.body ?? "",
                dateCreated: msg.dateCreated?.toISOString(),
                deliveryStatus: "sent",
              },
            ];
          });
        });
      } catch (err) {
        console.error("[chat] load conversation failed", err);
        setError(err instanceof Error ? err.message : "Failed to load conversation.");
      } finally {
        if (active) setMessagesLoading(false);
      }
    };

    loadConversation();
    return () => {
      active = false;
      if (conversationRef.current) {
        conversationRef.current.removeAllListeners("messageAdded");
      }
    };
  }, [conversationSid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [realtimeMessages.length, conversationSid]);

  const openByBookingMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error("Missing auth token");
      return fetchWithAuth<{ id: number; sid: string }>(`/conversations/booking/${id}`, token, {
        method: "POST",
      });
    },
    onSuccess: (payload) => {
      setConversationSid(payload.sid);
      setConversationId(payload.id);
      setShowList(false);
      setError(null);
      conversationsQuery.refetch();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to open conversation.");
    },
  });

  const openAdminMutation = useMutation({
    mutationFn: async (payload: { hostId?: number; userId?: number }) => {
      if (!token) throw new Error("Missing auth token");
      return fetchWithAuth<{ id: number; sid: string }>("/conversations", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (payload) => {
      setConversationSid(payload.sid);
      setConversationId(payload.id);
      setShowList(false);
      setError(null);
      conversationsQuery.refetch();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to open conversation.");
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { author: string; body: string }) => {
      if (!conversationSid) throw new Error("Missing conversation.");
      if (!token) throw new Error("Missing auth token");
      return fetchWithAuth<{ sid: string }>(`/conversations/${conversationSid}/messages`, token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      if (conversationSid && token) {
        fetchWithAuth<{ success: boolean }>(`/conversations/${conversationSid}/last-message`, token, {
          method: "POST",
        }).catch((err) => {
          console.error("[chat] last message update failed", err);
        });
        conversationsQuery.refetch();
      }
    },
    onError: (err: unknown) => {
      const errorPayload =
        err instanceof Error
          ? { message: err.message, stack: err.stack }
          : { error: err };
      console.error("[chat] send message failed", {
        ...errorPayload,
        identity,
        conversationSid,
        connectionState,
      });
      refreshTwilioClient().catch((refreshErr) => {
        console.error("[chat] client refresh failed after send error", refreshErr);
      });
      setError(err instanceof Error ? err.message : "Failed to send message.");
    },
  });

  const handleOpenBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!bookingId) {
      setError("Booking ID is required.");
      return;
    }
    openByBookingMutation.mutate(bookingId);
  };

  const handleOpenBookingId = (id: number) => {
    const idString = String(id);
    setBookingId(idString);
    openByBookingMutation.mutate(idString);
  };

  useEffect(() => {
    if (!initialBookingId || !token) return;
    handleOpenBookingId(initialBookingId);
  }, [initialBookingId, token]);

  const handleOpenAdmin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!hostId && !userId) {
      setError("Provide either a host ID or user ID.");
      return;
    }
    if (hostId && userId) {
      setError("Provide only one: host ID or user ID.");
      return;
    }
    openAdminMutation.mutate({
      hostId: hostId ? Number(hostId) : undefined,
      userId: userId ? Number(userId) : undefined,
    });
  };

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!identity) {
      setError("Missing identity.");
      return;
    }
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Message cannot be empty.");
      return;
    }
    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimistic: MessageRow = {
      sid: localId,
      localId,
      author: identity,
      body: trimmed,
      dateCreated: new Date().toISOString(),
      deliveryStatus: "sending",
    };
    setRealtimeMessages((prev) => [...prev, optimistic]);
    setMessage("");
    sendMessageMutation.mutate(
      { author: identity, body: trimmed },
      {
        onSuccess: (payload) => {
          setRealtimeMessages((prev) => {
            const updated = prev.map((item) =>
              item.localId === localId
                ? { ...item, sid: payload.sid, deliveryStatus: "sent" }
                : item,
            );
            return updated.filter((item) => item.sid !== payload.sid || item.localId === localId);
          });
        },
      },
    );
  };

  const isOwnMessage = (author?: string) => Boolean(identity && author === identity);
  const getHostIdentity = (hostId?: number | null) => (hostId ? `host_${hostId}` : null);
  const getInitials = (value?: string | null) => {
    if (!value) return "?";
    const parts = value.trim().split(/\s+/);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
  };
  const activeConversation = conversationsQuery.data?.find(
    (conversation) => conversation.twilioSid === conversationSid
  );
  const hostDisplayName =
    activeConversation?.hostDisplayName ??
    activeConversation?.hostName ??
    activeConversation?.hostEmail ??
    "Host";
  const guestDisplayName =
    activeConversation?.guestName ??
    activeConversation?.userEmail ??
    "Guest";
  const hostAvatarUrl = activeConversation?.hostAvatarUrl ?? null;
  const hostIdentity = getHostIdentity(activeConversation?.hostId ?? null);
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
        <div
          className={
            conversationSid && !showList
              ? "grid gap-6"
              : "grid gap-6 lg:grid-cols-[320px_1fr]"
          }
        >
          {(!conversationSid || showList) && (
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
                  const isActive = conversation.twilioSid === conversationSid;
                  const bookingLabel = conversation.bookingId
                    ? `Booking #${conversation.bookingId}`
                    : `Conversation #${conversation.id}`;
                  const listingLine = conversation.listingTitle
                    ? `${conversation.listingTitle} · ${conversation.listingCity ?? ""} ${conversation.listingCountry ?? ""}`.trim()
                    : null;
                  const dateLine =
                    conversation.bookingStartDate && conversation.bookingEndDate
                      ? `${new Date(conversation.bookingStartDate).toLocaleDateString()} – ${new Date(
                          conversation.bookingEndDate,
                        ).toLocaleDateString()}`
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
                    conversation.hostDisplayName ??
                    conversation.hostName ??
                    conversation.hostEmail ??
                    "Host";
                  return (
                    <button
                      type="button"
                      key={conversation.id}
                      onClick={() => {
                        setConversationSid(conversation.twilioSid);
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
                            {subtitleLine && (
                              <p className="text-xs text-slate-500">{subtitleLine}</p>
                            )}
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
                      {listingLine && (
                        <p className="mt-1 text-xs text-slate-500">{listingLine}</p>
                      )}
                      {dateLine && <p className="text-xs text-slate-400">{dateLine}</p>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No conversations yet.</p>
            )}

            <form className="grid gap-3" onSubmit={handleOpenBooking}>
              <label className="text-sm font-medium text-slate-600">
                Booking ID (open or create)
                <Input
                  className="mt-1 rounded-2xl border-emerald-100 focus-visible:ring-emerald-200"
                  placeholder="e.g. 5"
                  value={bookingId}
                  onChange={(event) => setBookingId(event.target.value)}
                />
              </label>
              <Button
                type="primary"
                className="rounded-2xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                buttonType="submit"
                disabled={openByBookingMutation.isPending}
              >
                {openByBookingMutation.isPending ? "Opening..." : "Open booking chat"}
              </Button>
            </form>

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
                    onChange={(event) => setHostId(event.target.value)}
                  />
                </label>
                <label className="text-sm font-medium text-slate-600">
                  User ID
                  <Input
                    className="mt-1 rounded-2xl border-emerald-100 focus-visible:ring-emerald-200"
                    placeholder="user id"
                    value={userId}
                    onChange={(event) => setUserId(event.target.value)}
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
            {conversationSid ? (
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
                      <p className="text-xs text-slate-500">
                        Sid: {conversationSid}
                        {conversationId ? ` · ID ${conversationId}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      {realtimeMessages.length} messages · {connectionState}
                    </span>
                    <Button
                      type="secondary"
                      className="rounded-2xl border-emerald-100 bg-white px-3 py-2 text-xs text-emerald-900"
                      onClick={() => setShowList(true)}
                    >
                      Back to list
                    </Button>
                  </div>
                </div>
                <div className="max-h-[520px] space-y-3 overflow-y-auto px-5 py-6 text-sm">
                  {messagesLoading ? (
                    <p className="text-slate-500">Loading messages...</p>
                  ) : realtimeMessages.length > 0 ? (
                    realtimeMessages.map((msg) => {
                      const showHostAvatar = Boolean(
                        hostIdentity && msg.author === hostIdentity && !isOwnMessage(msg.author)
                      );
                      return (
                      <div
                        key={msg.localId ?? msg.sid}
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
                          <p className="text-sm">{msg.body}</p>
                          {msg.dateCreated && (
                            <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                              <span>{new Date(msg.dateCreated).toLocaleString()}</span>
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
                  <Input
                    className="flex-1 rounded-full border-emerald-100 bg-white px-4 py-2 focus-visible:ring-emerald-200"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
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
    if (!status) return null;
    if (status === "sending") {
      return (
        <span className="inline-flex h-3 w-3 items-center justify-center">
          <svg viewBox="0 0 16 16" className="h-3 w-3 text-current">
            <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.5v3.8l2.6 1.7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      );
    }
    if (status === "read") {
      return (
        <span className="inline-flex h-3 w-5 items-center justify-center text-sky-200">
          <svg viewBox="0 0 20 16" className="h-3 w-5">
            <path d="M2 8.5l3 3.2 6-6.7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 11l6-6.7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    }
    if (status === "delivered") {
      return (
        <span className="inline-flex h-3 w-5 items-center justify-center text-white/80">
          <svg viewBox="0 0 20 16" className="h-3 w-5">
            <path d="M2 8.5l3 3.2 6-6.7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 11l6-6.7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    }
    return (
      <span className="inline-flex h-3 w-3 items-center justify-center text-white/80">
        <svg viewBox="0 0 16 16" className="h-3 w-3">
          <path d="M2.5 8.5l3 3.2 7-7.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  };
