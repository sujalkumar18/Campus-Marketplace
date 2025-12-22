import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft, FileText, ShoppingCart, Calendar, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Listing } from "@shared/schema";

export default function ListingDetail() {
  const [, params] = useRoute("/listing/:id");
  const [, setLocation] = useLocation();
  const listingId = Number(params?.id);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { data: listing, isLoading } = useQuery<Listing>({
    queryKey: [`/api/listings/${listingId}`],
    enabled: !!listingId,
  });

  const buyMutation = useMutation({
    mutationFn: (data: { listingId: number; type: "buy" | "rent"; quantity?: number }) =>
      apiRequest("POST", "/api/purchase", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${listingId}`] });
      alert("Order placed successfully! Start a chat with the seller to arrange delivery.");
      setLocation("/chats");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Listing not found</p>
      </div>
    );
  }

  const images = Array.isArray(listing.imageUrls) ? listing.imageUrls : [];
  const currentImageIndex = 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={() => setLocation("/home")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-foreground flex-1 truncate">{listing.title}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 max-w-md mx-auto">
        {/* Images */}
        {images.length > 0 ? (
          <div className="mb-6">
            <img
              src={images[currentImageIndex]}
              alt={listing.title}
              className="w-full aspect-square rounded-2xl object-cover"
            />
            {images.length > 1 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                1 of {images.length} photos
              </p>
            )}
          </div>
        ) : (
          <div className="w-full aspect-square rounded-2xl bg-muted flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Details */}
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-3xl font-bold text-primary">₹{listing.price}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Category</p>
            <span className="inline-block px-3 py-1 bg-muted rounded-full text-sm font-medium">
              {listing.category}
            </span>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Type</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${
                listing.type === "sell" ? "bg-emerald-500" : "bg-blue-500"
              }`}
            >
              {listing.type === "sell" ? "For Sale" : "For Rent"}
            </span>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Description</p>
            <p className="text-foreground leading-relaxed">{listing.description}</p>
          </div>

          {/* PDF Section */}
          {listing.pdfUrl && (
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">PDF Notes Available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Preview {listing.pdfSlidesAllowed || "all"} slides/pages
                  </p>
                  <button
                    onClick={() => setShowPdfModal(true)}
                    className="mt-2 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
                    data-testid="button-view-pdf"
                  >
                    View PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buy/Rent Actions */}
        <div className="space-y-3 fixed bottom-24 left-4 right-4 max-w-md mx-auto">
          {listing.type === "sell" ? (
            <button
              onClick={() => buyMutation.mutate({ listingId: listing.id, type: "buy" })}
              disabled={buyMutation.isPending}
              className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
              data-testid="button-buy"
            >
              <ShoppingCart className="w-5 h-5" />
              {buyMutation.isPending ? "Processing..." : "Buy Now"}
            </button>
          ) : (
            <>
              <div className="flex gap-2 items-center bg-muted/50 px-3 py-2 rounded-lg border border-border">
                <span className="text-sm text-muted-foreground">Quantity:</span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2 py-1 hover:bg-muted rounded"
                    data-testid="button-qty-decrease"
                  >
                    −
                  </button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2 py-1 hover:bg-muted rounded"
                    data-testid="button-qty-increase"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() =>
                  buyMutation.mutate({ listingId: listing.id, type: "rent", quantity })
                }
                disabled={buyMutation.isPending}
                className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                data-testid="button-rent"
              >
                <Calendar className="w-5 h-5" />
                {buyMutation.isPending ? "Processing..." : "Rent Now"}
              </button>
            </>
          )}

          <button
            onClick={() => setLocation(`/chats/${listing.id}`)}
            className="w-full py-3 px-4 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-all"
            data-testid="button-chat-seller"
          >
            Chat with Seller
          </button>
        </div>
      </main>

      {/* PDF Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between sticky-top">
              <h2 className="font-bold text-foreground">PDF Preview</h2>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-close-pdf"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <p className="text-sm text-muted-foreground mb-4">
                You can preview the first {listing.pdfSlidesAllowed || "all"} pages of this PDF.
              </p>
              <div className="bg-muted rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  PDF content would be displayed here in a production app
                </p>
                <a
                  href={listing.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  data-testid="link-download-pdf"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
