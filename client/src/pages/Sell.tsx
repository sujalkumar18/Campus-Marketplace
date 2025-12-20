import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useCreateListing } from "@/hooks/use-listings";
import { useLocation } from "wouter";
import { Camera, Upload, Loader2, IndianRupee } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListingSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertListingSchema.extend({
  price: z.coerce.number().min(1, "Price must be at least 1"),
});

type FormData = z.infer<typeof formSchema>;

const CATEGORIES = ["Books", "Notes", "Calculators", "Lab Equipment", "Hostel Items"];

export default function Sell() {
  const [, setLocation] = useLocation();
  const { mutate: createListing, isPending } = useCreateListing();
  const [listingType, setListingType] = useState<"sell" | "rent">("sell");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "sell",
      sellerId: 1, // Hardcoded for MVP as we don't have full auth context provider yet
      category: "Books",
      imageUrl: "",
    }
  });

  const imageUrl = watch("imageUrl");

  const onSubmit = (data: FormData) => {
    createListing({ ...data, type: listingType }, {
      onSuccess: () => setLocation("/home"),
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-display font-bold text-foreground">List Item</h1>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Image Upload Simulation */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground ml-1">Photo</label>
            <div className="relative aspect-video rounded-2xl bg-muted/50 border-2 border-dashed border-border hover:border-primary/50 transition-colors overflow-hidden group">
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium">Paste image URL below</span>
                </div>
              )}
            </div>
            <input
              {...register("imageUrl")}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:outline-none focus:border-primary text-sm"
            />
            {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
          </div>

          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-xl">
            <button
              type="button"
              onClick={() => setListingType("sell")}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                listingType === "sell"
                  ? "bg-white shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sell
            </button>
            <button
              type="button"
              onClick={() => setListingType("rent")}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                listingType === "rent"
                  ? "bg-white shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Rent
            </button>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">Title</label>
              <input
                {...register("title")}
                placeholder="e.g. Engineering Mathematics Vol 1"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1">Price (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="number"
                    {...register("price")}
                    placeholder="500"
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  />
                </div>
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1">Category</label>
                <select
                  {...register("category")}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">Description</label>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Condition, edition, any defects..."
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none"
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
          </div>

          <button
            disabled={isPending}
            type="submit"
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-70 transition-all flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Upload className="w-5 h-5" />}
            <span>Post Listing</span>
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
