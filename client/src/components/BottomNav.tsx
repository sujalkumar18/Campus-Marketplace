import { Link, useLocation } from "wouter";
import { Home, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/sell", icon: PlusCircle, label: "Sell" },
    { href: "/chats", icon: MessageCircle, label: "Chat" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href} className="w-full h-full">
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 cursor-pointer",
                  isActive
                    ? "text-primary scale-105"
                    : "text-muted-foreground hover:text-primary/70"
                )}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(isActive && "drop-shadow-sm")}
                />
                <span className="text-[10px] font-medium">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
