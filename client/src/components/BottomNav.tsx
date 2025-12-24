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
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white border-t border-border/40 shadow-lg safe-area-bottom z-50 backdrop-blur-md">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href} className="w-full h-full">
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-all duration-200 cursor-pointer active:scale-95",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary/70"
                )}
              >
                {isActive && (
                  <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full gradient-primary"></div>
                )}
                <Icon
                  size={26}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(isActive && "drop-shadow-md")}
                />
                <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
