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
      className="group bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <Icon className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
           <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm backdrop-blur-md",
              listing.type === "sell"
                ? "bg-emerald-500/90 text-white"
                : "bg-blue-500/90 text-white"
            )}
          >
            {listing.type}
          </span>
          {listing.status !== 'available' && (
             <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-800/90 text-white shadow-sm backdrop-blur-md">
               {listing.status}
             </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-display font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-grow">
          {listing.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">₹{listing.price}</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {listing.category}
          </span>
        </div>
      </div>
    </div>
  );
}
