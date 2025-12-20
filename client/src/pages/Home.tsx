import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { CategoryPill } from "@/components/CategoryPill";
import { ListingCard } from "@/components/ListingCard";
import { useListings, useCreateListing } from "@/hooks/use-listings";
import { useChats, useCreateChat } from "@/hooks/use-chats";
import { Search, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

const CATEGORIES = ["All", "Books", "Notes", "Calculators", "Lab Equipment", "Hostel Items"];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();

  const { data: listings, isLoading } = useListings({
    category: activeCategory === "All" ? undefined : activeCategory,
    search: searchTerm || undefined,
  });

  const { mutate: createChat } = useCreateChat();

  const handleListingClick = (listingId: number) => {
    // In a real app, this would go to a details page.
    // For MVP, checking if we want to chat.
    createChat({ listingId }, {
      onSuccess: (chat) => {
        setLocation(`/chats/${chat.id}`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-4 safe-top">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-display font-bold text-foreground">
              CampusRent
            </h1>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-bold text-primary text-xs">AU</span>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search books, notes, calculators..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
            />
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="pt-4 pb-2 overflow-x-auto no-scrollbar px-4">
        <div className="flex gap-2 w-max">
          {CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              isActive={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* Feed */}
      <main className="px-4 py-4 max-w-md mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Finding great deals...</p>
          </div>
        ) : listings?.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
            <p className="text-lg font-semibold text-foreground">No items found</p>
            <p className="text-sm text-muted-foreground mt-1">Try changing the category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {listings?.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => handleListingClick(listing.id)}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
