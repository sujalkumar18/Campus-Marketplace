import { Link, useLocation } from "wouter";
import { Home, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChats } from "@/hooks/use-chats";

export function BottomNav() {
  const [location] = useLocation();
  const { data: chats } = useChats();

  const unreadChatsCount = chats?.filter(chat => chat.unreadCount > 0).length || 0;

  const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/sell", icon: PlusCircle, label: "Sell" },
    { href: "/chats", icon: MessageCircle, label: "Chat", badge: unreadChatsCount },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white border-t border-border/40 shadow-lg safe-area-bottom z-50 backdrop-blur-md">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href} className="w-full h-full">
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-all duration-200 cursor-pointer active:scale-95 relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary/70"
                )}
              >
                {isActive && (
                  <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full gradient-primary"></div>
                )}
                <div className="relative">
                  <Icon
                    size={26}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={cn(isActive && "drop-shadow-md")}
                  />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-[10px] text-white rounded-full flex items-center justify-center border-2 border-white animate-pulse font-black">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
