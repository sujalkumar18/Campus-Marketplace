import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { CategoryPill } from "@/components/CategoryPill";
import { ListingCard } from "@/components/ListingCard";
import { useListings, useCreateListing } from "@/hooks/use-listings";
import { useChats, useCreateChat } from "@/hooks/use-chats";
import { Search, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

const CATEGORIES = ["All", "Books", "Notes", "Calculators", "Lab Equipment", "Other Items"];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();

  const { data: listings, isLoading } = useListings({
    category: activeCategory === "All" ? undefined : activeCategory,
  });

  const filteredListings = listings?.filter((listing) => {
    const matchesSearch = !searchTerm || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const isAvailable = listing.status !== "sold" && listing.status !== "rented";
    return matchesSearch && isAvailable;
  }) || [];

  const { mutate: createChat } = useCreateChat();

  const handleListingClick = (listingId: number) => {
    setLocation(`/listing/${listingId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-b from-background via-background/95 to-background/80 backdrop-blur-lg border-b border-border/40 px-4 py-5 safe-top shadow-sm-elevation">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-black text-foreground leading-tight">
                CampusRent
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Campus Marketplace</p>
            </div>
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-md-elevation">
              <span className="font-black text-white text-sm">AU</span>
            </div>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find books, notes, gear..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-border/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 text-sm font-medium transition-all shadow-sm-elevation"
            />
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="pt-5 pb-3 overflow-x-auto no-scrollbar px-4 bg-gradient-to-b from-background/50 to-transparent">
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
      <main className="px-4 py-6 max-w-md mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="relative w-12 h-12">
              <Loader2 className="w-12 h-12 text-primary animate-spin absolute" />
              <div className="w-12 h-12 gradient-primary rounded-full blur-xl opacity-30 absolute"></div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Scouting for treasures...</p>
          </div>
        ) : (
          <>
            {filteredListings.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-b from-muted/20 to-muted/5 rounded-3xl border-2 border-dashed border-border">
                <div className="w-16 h-16 rounded-full gradient-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-semibold text-foreground">No items found</p>
                <p className="text-sm text-muted-foreground mt-2">Try a different search term or category!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClick={() => handleListingClick(listing.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
