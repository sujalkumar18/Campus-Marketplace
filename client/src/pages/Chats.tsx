import { BottomNav } from "@/components/BottomNav";
import { useChats } from "@/hooks/use-chats";
import { Link } from "wouter";
import { MessageCircle, ChevronRight, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Chats() {
  const { data: chats, isLoading } = useChats();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-display font-bold text-foreground">Messages</h1>
        </div>
      </header>

      <main className="px-4 py-4 max-w-md mx-auto space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : chats?.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <MessageCircle className="w-12 h-12 mx-auto mb-2" />
            <p>No active conversations</p>
          </div>
        ) : (
          chats?.map((chat) => (
            <Link key={chat.id} href={`/chats/${chat.id}`} className="block">
              <div className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex items-center gap-4 group">
                {/* Avatar Placeholder */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                  {chat.otherUser?.username?.[0]?.toUpperCase() || "U"}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-foreground truncate">
                      {chat.otherUser?.username || "Unknown User"}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {chat.createdAt ? formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded text-foreground font-medium">
                      {chat.listing?.title || "Item"}
                    </span>
                    <p className="text-sm text-muted-foreground truncate">
                      Click to view conversation
                    </p>
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
}
