import { useAuth } from "@/hooks/use-auth";
import { useEffect, useRef, useState } from "react";
import { useRoute, Link } from "wouter";
import { useChatMessages, useSendMessage, useChats, useCreateChat } from "@/hooks/use-chats";
import { useUpdateListing } from "@/hooks/use-listings";
import { ArrowLeft, Send, MoreVertical, Loader2, CheckCircle2, History, Calendar, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";

const QUICK_REPLIES = [
  "I'm at the library",
  "Coming in 5 mins",
  "Let's reschedule",
  "Is this still available?"
];

export default function ChatDetail() {
  const [, params] = useRoute("/chats/:id");
  const { user } = useAuth();
  const chatId = Number(params?.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRentalDetails, setShowRentalDetails] = useState(false);
  
  const { data: chats } = useChats();
  const { mutate: createChatMutation } = useCreateChat();
  const currentChat = chats?.find(c => c.id === chatId);
  const listing = currentChat?.listing;
  const isSeller = currentChat?.sellerId === user?.id;

  const { data: messages, isLoading, refetch: refetchMessages } = useChatMessages(chatId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: updateListing } = useUpdateListing();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const { data: rental, refetch: refetchRental } = useQuery({
    queryKey: ["/api/rentals", chatId],
    queryFn: async () => {
      const res = await fetch(`/api/rentals/${chatId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!chatId
  });

  const confirmRentalMutation = useMutation({
    mutationFn: async (data: { id: number, confirmedBy: "buyer" | "seller", type: "start" | "end" | "date" | "verify_otp" | "reject_date", date?: string, otp?: string }) => {
      const res = await fetch(`/api/rentals/${data.id}/confirm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmedBy: data.confirmedBy, type: data.type, date: data.date, otp: data.otp })
      });
      return res.json();
    },
    onSuccess: () => {
      refetchRental();
      refetchMessages();
    }
  });

  const handleStatusUpdate = async (newStatus: "sold" | "rented" | "available") => {
    if (!listing) return;
    updateListing({ id: listing.id, status: newStatus });
    setShowStatusModal(false);
    
    if (newStatus === "rented") {
      await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          listingId: listing.id,
          returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
      });
      refetchRental();
      // Auto-expand rental details when a rental is started
      setShowRentalDetails(true);
    }

    const statusText = newStatus === "sold" ? "marked as sold" : 
                      newStatus === "rented" ? "marked as rented" : "marked as available";
    
    handleSend(`[System] This item has been ${statusText}.`);
  };

  const handleSend = (text: string = inputText) => {
    if (!text.trim()) return;
    sendMessage(
      { chatId, content: text },
      {
        onSuccess: () => setInputText("")
      }
    );
  };

  const CURRENT_USER_ID = user?.id || 1;

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex-none bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/chats" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-foreground truncate">
                {currentChat?.otherUser?.username || "Chat"}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Online
                </p>
                {listing && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase",
                    listing.status === "available" ? "bg-emerald-100 text-emerald-700" :
                    listing.status === "sold" ? "bg-amber-100 text-amber-700" :
                    "bg-blue-100 text-blue-700"
                  )}>
                    {listing.status}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {isSeller && listing?.status === "available" && (
              <button 
                onClick={() => setShowStatusModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Action
              </button>
            )}
            <button className="p-2 hover:bg-muted rounded-full">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center p-4">
          <div className="bg-background w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6 space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold">Update Listing Status</h3>
                <p className="text-sm text-muted-foreground">Select an action for this item</p>
              </div>
              <div className="grid gap-3">
                {listing?.type === "sell" ? (
                  <button 
                    onClick={() => handleStatusUpdate("sold")}
                    className="flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl transition-colors border border-emerald-100"
                  >
                    <div className="text-left">
                      <p className="font-bold">Mark as Sold</p>
                      <p className="text-xs opacity-80">This will hide the item from search</p>
                    </div>
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                ) : (
                  <button 
                    onClick={() => handleStatusUpdate("rented")}
                    className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl transition-colors border border-blue-100"
                  >
                    <div className="text-left">
                      <p className="font-bold">Mark as Rented</p>
                      <p className="text-xs opacity-80">Track the rental period</p>
                    </div>
                    <Calendar className="w-6 h-6" />
                  </button>
                )}
                <button 
                  onClick={() => setShowStatusModal(false)}
                  className="w-full py-4 text-sm font-bold text-muted-foreground hover:bg-muted rounded-2xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        <div className="max-w-md mx-auto space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="flex justify-center py-10 text-muted-foreground">
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === CURRENT_USER_ID;
                const isLastMessage = idx === messages.length - 1;
                
                return (
                  <div key={msg.id} className="space-y-4">
                    <div
                      className={cn(
                        "flex w-full",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-white border border-border text-foreground rounded-tl-none"
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>

                    {/* Integrated Rental Tracking - Shown after the very last message */}
                    {isLastMessage && rental && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 py-2">
                        <div className="space-y-3">
                          <button 
                            onClick={() => setShowRentalDetails(!showRentalDetails)}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-2xl border transition-all shadow-sm",
                              rental.status === "pending" ? "bg-amber-50 border-amber-100 text-amber-700" :
                              rental.status === "active" ? "bg-blue-50 border-blue-100 text-blue-700" :
                              "bg-emerald-50 border-emerald-100 text-emerald-700"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span className="font-bold text-sm">Rental Tracking: {rental.status.toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium opacity-70">
                                {showRentalDetails ? "Hide Details" : "Show Details"}
                              </span>
                              {showRentalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </button>

                          {showRentalDetails && (
                            <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
                              <div className="space-y-3">
                                {rental.status === "pending" && !rental.buyerAgreedDate && !rental.sellerAgreedDate && (
                                  <div className="space-y-2 p-2 bg-primary/5 rounded-xl border border-primary/10">
                                    <p className="text-xs font-bold text-primary flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      Buyer: Propose Return Timing
                                    </p>
                                    <div className="flex gap-2">
                                      {!isSeller ? (
                                        <>
                                          <input 
                                            type="datetime-local" 
                                            className="flex-1 text-xs p-1 rounded border"
                                            id="return-date-input-inline"
                                          />
                                          <button
                                            onClick={() => {
                                              const input = document.getElementById('return-date-input-inline') as HTMLInputElement;
                                              if (input?.value) {
                                                confirmRentalMutation.mutate({ 
                                                  id: rental.id, 
                                                  confirmedBy: "buyer", 
                                                  type: "date",
                                                  date: input.value
                                                });
                                              }
                                            }}
                                            className="px-3 py-1 bg-primary text-primary-foreground rounded text-[10px] font-bold"
                                          >
                                            Propose
                                          </button>
                                        </>
                                      ) : (
                                        <p className="text-[10px] text-muted-foreground italic">Waiting for buyer to propose a return date...</p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {rental.status === "pending" && (rental.buyerAgreedDate || rental.sellerAgreedDate) && !rental.buyerStarted && !rental.sellerStarted && (
                                   <div className="space-y-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                                     <p className="text-xs font-bold text-emerald-700">
                                       {rental.buyerAgreedDate ? "Buyer Proposed" : "Seller Agreed"}: {new Date(rental.returnDate).toLocaleString()}
                                     </p>
                                     <div className="flex gap-2">
                                        <button
                                          disabled={(isSeller && rental.sellerAgreedDate) || (!isSeller && rental.buyerAgreedDate) || confirmRentalMutation.isPending}
                                          onClick={() => confirmRentalMutation.mutate({ 
                                            id: rental.id, 
                                            confirmedBy: isSeller ? "seller" : "buyer", 
                                            type: "date",
                                            date: rental.returnDate
                                          })}
                                          className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold disabled:opacity-50 shadow-sm"
                                        >
                                          {(isSeller && rental.sellerAgreedDate) || (!isSeller && rental.buyerAgreedDate) ? "Waiting for Other" : "Agree to Date"}
                                        </button>
                                        <button
                                          disabled={confirmRentalMutation.isPending}
                                          onClick={() => {
                                            const newDate = prompt("Please propose a new return date (YYYY-MM-DDTHH:mm):", rental.returnDate);
                                            if (newDate) {
                                              confirmRentalMutation.mutate({ 
                                                id: rental.id, 
                                                confirmedBy: isSeller ? "seller" : "buyer", 
                                                type: "reject_date",
                                                date: newDate
                                              });
                                            }
                                          }}
                                          className="px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-[10px] font-bold hover:bg-destructive/20 transition-colors shadow-sm"
                                        >
                                          Not Agreed
                                        </button>
                                     </div>
                                   </div>
                                )}

                                {rental.status === "pending" && (rental.buyerAgreedDate && rental.sellerAgreedDate) && (
                                  <div className="space-y-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-xs text-blue-700 font-bold">Step 1: Handover OTP Confirmation</p>
                                    {isSeller ? (
                                      <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">Share this OTP with the buyer during handover:</p>
                                        <div className="bg-white p-3 rounded-lg border border-blue-200 text-center text-xl font-black tracking-widest text-blue-600">
                                          {rental.handoverOtp}
                                        </div>
                                        <button
                                          disabled={rental.sellerStarted || confirmRentalMutation.isPending}
                                          onClick={() => confirmRentalMutation.mutate({ id: rental.id, confirmedBy: "seller", type: "start" })}
                                          className={cn(
                                            "w-full py-2 rounded-lg text-xs font-bold transition-all",
                                            rental.sellerStarted ? "bg-emerald-100 text-emerald-700" : "bg-primary text-primary-foreground"
                                          )}
                                        >
                                          {rental.sellerStarted ? "Handover Confirmed" : "Confirm Handover"}
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">Enter the OTP provided by the seller:</p>
                                        <div className="flex gap-2">
                                          <input 
                                            id="handover-otp-input-inline"
                                            placeholder="4-digit OTP"
                                            className="flex-1 text-xs p-2 rounded border"
                                            maxLength={4}
                                          />
                                          <button
                                            onClick={() => {
                                              const val = (document.getElementById('handover-otp-input-inline') as HTMLInputElement)?.value;
                                              if (val) confirmRentalMutation.mutate({ id: rental.id, confirmedBy: "buyer", type: "verify_otp", otp: val });
                                            }}
                                            className="px-3 py-2 bg-primary text-primary-foreground rounded text-[10px] font-bold"
                                          >
                                            Verify
                                          </button>
                                        </div>
                                        <button
                                          disabled={rental.buyerStarted || !rental.handoverOtpVerified || confirmRentalMutation.isPending}
                                          onClick={() => confirmRentalMutation.mutate({ id: rental.id, confirmedBy: "buyer", type: "start" })}
                                          className={cn(
                                            "w-full py-2 rounded-lg text-xs font-bold transition-all",
                                            rental.buyerStarted ? "bg-emerald-100 text-emerald-700" : "bg-primary text-primary-foreground"
                                          )}
                                        >
                                          {rental.buyerStarted ? "Receipt Confirmed" : rental.handoverOtpVerified ? "Finalize Receipt" : "Awaiting OTP Verification"}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {rental.status === "active" && (
                                  <div className="space-y-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <div className="flex justify-between items-center text-xs mb-1">
                                      <span className="text-amber-700 font-bold">Agreement Return:</span>
                                      <span className="font-bold">{new Date(rental.returnDate).toLocaleString()}</span>
                                    </div>
                                    {isSeller ? (
                                       <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground font-medium">Verify buyer's return OTP:</p>
                                        <div className="flex gap-2">
                                          <input 
                                            id="return-otp-input-inline"
                                            placeholder="4-digit OTP"
                                            className="flex-1 text-xs p-2 rounded border"
                                            maxLength={4}
                                          />
                                          <button
                                            onClick={() => {
                                              const val = (document.getElementById('return-otp-input-inline') as HTMLInputElement)?.value;
                                              if (val) confirmRentalMutation.mutate({ id: rental.id, confirmedBy: "seller", type: "verify_otp", otp: val });
                                            }}
                                            className="px-3 py-2 bg-primary text-primary-foreground rounded text-[10px] font-bold"
                                          >
                                            Verify
                                          </button>
                                        </div>
                                        <button
                                          disabled={rental.sellerConfirmed || !rental.returnOtpVerified || confirmRentalMutation.isPending}
                                          onClick={() => confirmRentalMutation.mutate({ id: rental.id, confirmedBy: "seller", type: "end" })}
                                          className={cn(
                                            "w-full py-2 rounded-lg text-xs font-bold transition-all",
                                            rental.sellerConfirmed ? "bg-emerald-100 text-emerald-700" : "bg-blue-600 text-white"
                                          )}
                                        >
                                          {rental.sellerConfirmed ? "Return Confirmed" : rental.returnOtpVerified ? "Finalize Return" : "Verify OTP First"}
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">Show this OTP to seller during return:</p>
                                        <div className="bg-white p-3 rounded-lg border border-amber-200 text-center text-xl font-black tracking-widest text-amber-600">
                                          {rental.returnOtp}
                                        </div>
                                        <button
                                          disabled={rental.buyerConfirmed || !rental.returnOtpVerified || confirmRentalMutation.isPending}
                                          onClick={() => confirmRentalMutation.mutate({ id: rental.id, confirmedBy: "buyer", type: "end" })}
                                          className={cn(
                                            "w-full py-2 rounded-lg text-xs font-bold transition-all",
                                            rental.buyerConfirmed ? "bg-emerald-100 text-emerald-700" : 
                                            rental.returnOtpVerified ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground cursor-not-allowed"
                                          )}
                                        >
                                          {rental.buyerConfirmed ? "Campus Return Completed" : "Campus Return"}
                                        </button>
                                        {!rental.returnOtpVerified && (
                                          <p className="text-[10px] text-center text-muted-foreground italic">
                                            "Campus Return" will be available after seller verifies your OTP.
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="h-4" />
        </div>
      </div>

      <div className="flex-none bg-white border-t border-border p-4 safe-area-bottom">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                onClick={() => handleSend(reply)}
                className="whitespace-nowrap px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-full text-xs font-medium transition-colors border border-border/50"
              >
                {reply}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-muted/50 border-none rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2.5 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:scale-95 active:scale-95 shadow-lg shadow-primary/20"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
