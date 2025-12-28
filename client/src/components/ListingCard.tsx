import { cn } from "@/lib/utils";
import { Tag, Book, Calculator, FlaskConical, Package, FileText } from "lucide-react";
import type { Listing } from "@shared/schema";

interface ListingCardProps {
  listing: Listing;
  onClick: () => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  Books: Book,
  Notes: FileText,
  Calculators: Calculator,
  "Lab Equipment": FlaskConical,
  "Other Items": Package,
};

export function ListingCard({ listing, onClick }: ListingCardProps) {
  const Icon = CATEGORY_ICONS[listing.category] || Tag;
  const images = Array.isArray(listing.imageUrls) ? listing.imageUrls : [];
  const firstImage = images.length > 0 ? images[0] : null;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-border/40 shadow-sm-elevation overflow-hidden hover:shadow-lg-elevation hover:border-primary/30 transition-all duration-300 cursor-pointer flex flex-col h-full active:scale-95"
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <Icon className="w-16 h-16 text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="absolute top-3 right-3 flex gap-2">
           <span
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md-elevation backdrop-blur-sm",
              listing.type === "sell"
                ? "bg-emerald-500/95 text-white"
                : "bg-secondary/95 text-white"
            )}
          >
            {listing.type === "sell" ? "For Sale" : "For Rent"}
          </span>
          {listing.status !== 'available' && (
             <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-700/95 text-white shadow-md-elevation backdrop-blur-sm">
               {listing.status}
             </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow bg-gradient-card">
        <h3 className="font-display font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/30">
          <div className="w-16 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">₹{listing.price}</span>
          </div>
          <span className="text-xs text-muted-foreground bg-muted/60 px-2.5 py-1.5 rounded-lg font-semibold">
            {listing.category}
          </span>
        </div>
      </div>
    </div>
  );
}
