import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft, FileText, ShoppingCart, Calendar, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { useCreateChat } from "@/hooks/use-chats";
import { Document, Page, pdfjs } from "react-pdf";
import type { Listing } from "@shared/schema";

// Set up PDF.js worker from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function ListingDetail() {
  const [, params] = useRoute("/listing/:id");
  const [, setLocation] = useLocation();
  const listingId = Number(params?.id);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfNumPages, setPdfNumPages] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestType, setInterestType] = useState<"buy" | "rent" | null>(null);
  const [returnDate, setReturnDate] = useState("");
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);

  const { data: listing, isLoading } = useQuery<Listing>({
    queryKey: [`/api/listings/${listingId}`],
    enabled: !!listingId,
  });

  const createChatMutation = useCreateChat();
  
  const handleCreateChat = async () => {
    try {
      const chat = await createChatMutation.mutateAsync({
        listingId: Number(listingId),
      });
      setShowInterestModal(false);
      setLocation(`/chats/${chat.id}`);
    } catch (error) {
      console.error("Failed to create chat:", error);
      alert("Failed to create chat. Please try again.");
    }
  };


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

  const handleRentalReturn = async () => {
    if (!returnDate) {
      alert("Please select a return date");
      return;
    }
    // This will be called when initiating rental
    setShowReturnConfirm(false);
    alert(`Return date set to ${new Date(returnDate).toLocaleDateString()}. Seller will confirm.`);
  };

  const images = Array.isArray(listing.imageUrls) ? listing.imageUrls : [];
  const currentImageIndex = 0;
  const isRental = listing.type === "rent";

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

          {listing.type === "rent" && (
            <div>
              <p className="text-sm text-muted-foreground mb-3 font-semibold">Rental Return Date</p>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Both you and seller must confirm return. Late returns: ₹500 penalty
              </p>
            </div>
          )}

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
        <div className="space-y-4 mt-8">
          {listing.type === "sell" ? (
            <>
              <button
                onClick={() => {
                  setInterestType("buy");
                  setShowInterestModal(true);
                }}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                data-testid="button-buy"
              >
                <ShoppingCart className="w-5 h-5" />
                Buy Now
              </button>
              <p className="text-xs text-muted-foreground text-center">Connect with seller to buy offline</p>
            </>
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
                onClick={() => {
                  setInterestType("rent");
                  setShowInterestModal(true);
                }}
                className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                data-testid="button-rent"
              >
                <Calendar className="w-5 h-5" />
                Rent Now
              </button>
              <p className="text-xs text-muted-foreground text-center">Connect with seller to rent offline</p>
            </>
          )}

          <button
            onClick={handleCreateChat}
            disabled={createChatMutation.isPending}
            className="w-full py-3 px-4 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
            data-testid="button-chat-seller"
          >
            {createChatMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Chat with Seller"
            )}
          </button>
        </div>
      </main>

      {/* PDF Modal */}
      {showPdfModal && listing.pdfUrl && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between sticky-top">
              <h2 className="font-bold text-foreground">PDF Preview</h2>
              <button
                onClick={() => {
                  setShowPdfModal(false);
                  setPdfCurrentPage(1);
                }}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-close-pdf"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4 flex flex-col">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Preview Limit: {listing.pdfSlidesAllowed} slides
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                  You can read the first {listing.pdfSlidesAllowed} slides of this PDF.
                </p>
              </div>

              {/* PDF Viewer */}
              <div className="flex-1 bg-muted rounded-lg flex items-center justify-center overflow-auto">
                <Document 
                  file={`${window.location.origin}${listing.pdfUrl}`}
                  onLoadSuccess={({ numPages }) => setPdfNumPages(numPages)}
                  loading={<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />}
                  error={<p className="text-red-600">Failed to load PDF</p>}
                >
                  {pdfCurrentPage <= (listing.pdfSlidesAllowed || numPages) && (
                    <Page 
                      pageNumber={pdfCurrentPage} 
                      width={280}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  )}
                </Document>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-2 bg-muted/50 p-3 rounded-lg">
                <button
                  onClick={() => setPdfCurrentPage(Math.max(1, pdfCurrentPage - 1))}
                  disabled={pdfCurrentPage === 1}
                  className="p-2 hover:bg-muted rounded disabled:opacity-50 transition-colors"
                  data-testid="button-pdf-prev"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-foreground">
                  {pdfCurrentPage} / {Math.min(listing.pdfSlidesAllowed || 0, pdfNumPages)}
                </span>
                <button
                  onClick={() => setPdfCurrentPage(Math.min(listing.pdfSlidesAllowed || pdfNumPages, pdfCurrentPage + 1))}
                  disabled={pdfCurrentPage >= (listing.pdfSlidesAllowed || 0)}
                  className="p-2 hover:bg-muted rounded disabled:opacity-50 transition-colors"
                  data-testid="button-pdf-next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Request Full Access */}
              <button
                onClick={() => {
                  setShowPdfModal(false);
                  setPdfCurrentPage(1);
                  handleCreateChat();
                }}
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                data-testid="button-contact-seller-pdf"
              >
                Request Full Access via Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interest Confirmation Modal */}
      {showInterestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl max-w-md w-full flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold text-foreground text-lg">Confirm Interest</h2>
            </div>
            <div className="p-6 space-y-4 text-center">
              <p className="text-foreground">
                You are showing interest in this item.
              </p>
              <p className="text-muted-foreground">
                Contact the seller to complete the deal in person.
              </p>
            </div>
            <div className="p-4 border-t border-border space-y-3 flex flex-col gap-2">
              <button
                onClick={handleCreateChat}
                disabled={createChatMutation.isPending}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                data-testid="button-continue-chat"
              >
                {createChatMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Continue to Chat"
                )}
              </button>
              <button
                onClick={() => {
                  setShowInterestModal(false);
                  setInterestType(null);
                }}
                className="w-full py-3 px-4 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-all"
                data-testid="button-cancel-interest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
