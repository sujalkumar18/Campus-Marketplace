import { useAuth } from "./use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type CreateChatInput = z.infer<typeof api.chats.create.input>;
type SendMessageInput = z.infer<typeof api.chats.sendMessage.input>;

export function useChats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [api.chats.list.path, user?.id],
    queryFn: async () => {
      const url = `${api.chats.list.path}?userId=${user?.id || 1}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch chats");
      return api.chats.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: CreateChatInput) => {
      const res = await fetch(api.chats.create.path, {
        method: api.chats.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, buyerId: user?.id || 1 }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create chat");
      return api.chats.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chats.list.path] });
    },
  });
}

export function useChatMessages(chatId: number) {
  return useQuery({
    queryKey: [api.chats.getMessages.path, chatId],
    queryFn: async () => {
      const url = buildUrl(api.chats.getMessages.path, { id: chatId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.chats.getMessages.responses[200].parse(await res.json());
    },
    enabled: !!chatId,
    refetchInterval: 3000, // Simple polling for MVP
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ chatId, content }: { chatId: number; content: string }) => {
      const url = buildUrl(api.chats.sendMessage.path, { id: chatId });
      const res = await fetch(url, {
        method: api.chats.sendMessage.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, senderId: user?.id || 1 }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.chats.sendMessage.responses[201].parse(await res.json());
    },
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: [api.chats.getMessages.path, chatId] });
    },
  });
}
