import { useEffect, useRef, useState } from "react";
import { useRoute, Link } from "wouter";
import { useChatMessages, useSendMessage } from "@/hooks/use-chats";
import { ArrowLeft, Send, MoreVertical, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_REPLIES = [
  "I'm at the library",
  "Coming in 5 mins",
  "Let's reschedule",
  "Is this still available?"
];

export default function ChatDetail() {
  const [, params] = useRoute("/chats/:id");
  const chatId = Number(params?.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");
  
  const { data: messages, isLoading } = useChatMessages(chatId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string = inputText) => {
    if (!text.trim()) return;
    sendMessage(
      { chatId, content: text },
      {
        onSuccess: () => setInputText("")
      }
    );
  };

  // Dummy current user ID for MVP styling (assuming we are sender 1)
  const CURRENT_USER_ID = 1;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex-none bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/chats" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <div>
              <h2 className="font-bold text-foreground">Chat</h2>
              <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-muted rounded-full">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        <div className="max-w-md mx-auto space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="flex justify-center py-10 text-muted-foreground">
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === CURRENT_USER_ID;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex w-full",
                    isMe ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-white border border-border text-foreground rounded-tl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          {/* Spacer for bottom bar */}
          <div className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none bg-white border-t border-border p-4 safe-area-bottom">
        <div className="max-w-md mx-auto space-y-3">
          {/* Quick Replies */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                onClick={() => handleSend(reply)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-foreground hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all"
              >
                {reply}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-xl bg-muted/30 border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="px-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
