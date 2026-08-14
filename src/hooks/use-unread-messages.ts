"use client";

// Unread message counts for badges.
//
// The conversations endpoint already returns `unreadCount` per conversation,
// so this is the one place that turns that into a per-conversation map plus a
// total. Live updates come from the same socket the chat uses: a `message:new`
// arriving anywhere refetches, so a badge appears without the host reloading.
import { useCallback, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useConversationSocketContext } from "@/contexts/ConversationSocketContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://humble-liberation-staging.up.railway.app";

export const unreadMessagesQueryKey = ["conversations", "unread"] as const;

type ConversationUnreadRow = {
  id: number;
  unreadCount?: number | null;
};

export const useUnreadMessages = (token: string | null) => {
  const queryClient = useQueryClient();
  const { socket } = useConversationSocketContext();

  const query = useQuery({
    queryKey: [...unreadMessagesQueryKey, token],
    enabled: Boolean(token),
    // Badges going stale is worse than an extra request; the payload is small.
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<ConversationUnreadRow[]> => {
      const response = await fetch(
        `${API_BASE_URL.replace(/\/$/, "")}/conversations?filter=all`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) return [];
      const payload = (await response.json()) as { conversations?: ConversationUnreadRow[] };
      return payload.conversations ?? [];
    },
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: unreadMessagesQueryKey });
  }, [queryClient]);

  useEffect(() => {
    if (!socket) return;
    // Both directions matter: a new message raises a badge, and marking a
    // thread read clears it — including when it was read on another device.
    socket.on("message:new", refresh);
    socket.on("conversation:read", refresh);
    socket.on("conversation:new", refresh);
    return () => {
      socket.off("message:new", refresh);
      socket.off("conversation:read", refresh);
      socket.off("conversation:new", refresh);
    };
  }, [socket, refresh]);

  const byConversation = useMemo(() => {
    const map = new Map<number, number>();
    for (const row of query.data ?? []) map.set(row.id, row.unreadCount ?? 0);
    return map;
  }, [query.data]);

  const total = useMemo(
    () => (query.data ?? []).reduce((sum, row) => sum + (row.unreadCount ?? 0), 0),
    [query.data],
  );

  return { total, byConversation, refresh };
};
