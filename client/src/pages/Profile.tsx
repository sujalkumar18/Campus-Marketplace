import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { useListings, useUpdateListing } from "@/hooks/use-listings";
import { User, MapPin, LogOut, Package, CheckCircle2, CircleDashed } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { data: listings } = useListings();
  const { mutate: updateListing } = useUpdateListing();
  
  // Default user info for MVP
  const user = { username: "Alliance Student", college: "Alliance University" };
  const myListings = listings?.filter(l => l.sellerId === 1) || [];

  const markAsSold = (id: number) => {
    updateListing({ id, status: "sold" });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Profile Header Card */}
      <div className="bg-primary text-primary-foreground pt-12 pb-24 px-4 rounded-b-[2.5rem] shadow-xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-md mx-auto relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border-4 border-white/20 flex items-center justify-center text-3xl font-bold shadow-2xl">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">{user.username}</h1>
            <div className="flex items-center justify-center gap-1.5 text-primary-foreground/80 mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{user.college}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 -mt-16 relative z-20 space-y-6">
        
        {/* Stats Card */}
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 flex justify-between items-center">
          <div className="text-center flex-1 border-r border-border">
            <p className="text-2xl font-bold text-foreground">
              {myListings.filter(l => l.status === 'sold').length}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">Sold</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-2xl font-bold text-foreground">
              {myListings.length}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">Total Items</p>
          </div>
        </div>

        {/* My Listings Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              My Listings
            </h2>
          </div>

          <div className="space-y-3">
            {myListings.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
                <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No items listed yet</p>
              </div>
            ) : (
              myListings.map((listing) => (
                <div key={listing.id} className="bg-card p-3 rounded-xl border border-border shadow-sm flex gap-3">
                  <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                    {listing.imageUrl ? (
                      <img src={listing.imageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-bold text-sm line-clamp-1">{listing.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">₹{listing.price}</p>
                    </div>
                    
                    {listing.status === 'available' ? (
                      <button 
                        onClick={() => markAsSold(listing.id)}
                        className="self-start flex items-center gap-1 text-xs font-medium text-primary hover:bg-primary/5 px-2 py-1 rounded-md transition-colors"
                      >
                        <CircleDashed className="w-3.5 h-3.5" />
                        Mark as Sold
                      </button>
                    ) : (
                      <div className="self-start flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Sold
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
