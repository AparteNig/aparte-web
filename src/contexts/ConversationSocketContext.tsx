"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";
import { io, type Socket } from "socket.io-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type MessageNew = {
  id: number;
  conversationId: number;
  senderType: "user" | "host" | "admin";
  senderId: number;
  body: string | null;
  mediaKey?: string;
  createdAt: string;
};

export type ConversationRead = {
  conversationId: number;
  entityType: "user" | "host" | "admin";
  readAt: string;
};

type SocketContextValue = {
  socket: Socket | null;
  sendMessage: (
    conversationId: number,
    body: string | null,
    mediaKey?: string
  ) => Promise<{ id: number; createdAt: string }>;
  markRead: (conversationId: number) => void;
  joinRoom: (conversationId: number) => void;
};

const ConversationSocketContext = createContext<SocketContextValue>({
  socket: null,
  sendMessage: () => Promise.reject(new Error("not connected")),
  markRead: () => {},
  joinRoom: () => {}
});

export const ConversationSocketProvider = ({
  token,
  children
}: {
  token: string | null;
  children: ReactNode;
}) => {
  const socketRef = useRef<Socket | null>(null);
  const [liveSocket, setLiveSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;
    const socket = io(API_BASE_URL, {
      auth: { token },
      // Polling first: App Runner doesn't support WebSockets, so the
      // upgrade fails there and the client stays on long-polling.
      transports: ["polling", "websocket"]
    });
    socketRef.current = socket;
    setLiveSocket(socket);
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setLiveSocket(null);
    };
  }, [token]);

  const sendMessage = useCallback(
    (conversationId: number, body: string | null, mediaKey?: string) =>
      new Promise<{ id: number; createdAt: string }>((resolve, reject) => {
        if (!socketRef.current?.connected) {
          reject(new Error("not connected"));
          return;
        }
        socketRef.current.emit(
          "message:send",
          { conversationId, body, mediaKey },
          (ack: { id: number; createdAt: string } | { error: string }) => {
            if ("error" in ack) reject(new Error(ack.error));
            else resolve(ack);
          }
        );
      }),
    []
  );

  const markRead = useCallback((conversationId: number) => {
    socketRef.current?.emit("conversation:read", { conversationId });
  }, []);

  const joinRoom = useCallback((conversationId: number) => {
    socketRef.current?.emit("conversation:join", { conversationId });
  }, []);

  return (
    <ConversationSocketContext.Provider
      value={{ socket: liveSocket, sendMessage, markRead, joinRoom }}
    >
      {children}
    </ConversationSocketContext.Provider>
  );
};

export const useConversationSocketContext = () =>
  useContext(ConversationSocketContext);
