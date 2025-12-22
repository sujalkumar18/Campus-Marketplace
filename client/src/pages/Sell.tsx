import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useCreateListing } from "@/hooks/use-listings";
import { useLocation } from "wouter";
import { Camera, Upload, Loader2, IndianRupee, X, FileText, Video } from "lucide-react";
import { useForm, watch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListingSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertListingSchema.extend({
  price: z.coerce.number().min(1, "Price must be at least 1"),
  imageUrls: z.array(z.string()).default([]),
  pdfUrl: z.string().optional(),
  pdfSlidesAllowed: z.coerce.number().optional(),
  videoUrl: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const CATEGORIES = ["Books", "Notes", "Calculators", "Lab Equipment", "Other Items"];

export default function Sell() {
  const [, setLocation] = useLocation();
  const { mutate: createListing, isPending } = useCreateListing();
  const [listingType, setListingType] = useState<"sell" | "rent">("sell");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfSlidesAllowed, setPdfSlidesAllowed] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch: watchForm,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "sell",
      sellerId: 1,
      category: "Books",
      imageUrls: [],
    }
  });

  const selectedCategory = watchForm("category");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (imageUrls.length >= 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          setImageUrls([...imageUrls, data.url]);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploading(false);
      }
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) setPdfUrl(data.url);
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) setVideoUrl(data.url);
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploading(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormData) => {
    const isNotesWithPdf = selectedCategory === "Notes" && pdfUrl;
    
    if (imageUrls.length === 0 && !isNotesWithPdf) {
      alert("Please upload at least 1 image");
      return;
    }
    
    if (isNotesWithPdf && !pdfSlidesAllowed) {
      alert("Please specify how many slides buyers can read");
      return;
    }
    
    createListing({
      ...data,
      imageUrls: imageUrls.length > 0 ? imageUrls : ["/uploads/no-image.png"],
      pdfUrl: pdfUrl || undefined,
      pdfSlidesAllowed: pdfSlidesAllowed ? parseInt(pdfSlidesAllowed) : undefined,
      videoUrl: videoUrl || undefined,
      type: listingType
    }, {
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
          
          {/* Image Upload (1-5 images) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground ml-1">Photos ({imageUrls.length}/5)</label>
              <span className="text-xs text-muted-foreground">
                {selectedCategory === "Notes" && pdfUrl ? "Optional" : "Minimum 1, Maximum 5"}
              </span>
            </div>
            
            {/* Image Grid */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-destructive/80 hover:bg-destructive text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Box */}
            {imageUrls.length < 5 && (
              <div className="relative aspect-video rounded-2xl bg-muted/50 border-2 border-dashed border-border hover:border-primary/50 transition-colors overflow-hidden group">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-center">Click to upload photo {imageUrls.length + 1}</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
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

            {/* PDF Upload (Optional - Only for Notes) */}
            {selectedCategory === "Notes" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <label className="text-sm font-medium text-foreground">Notes PDF (Optional)</label>
                  </div>
                  {pdfUrl ? (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                      <span className="text-sm text-foreground truncate">PDF uploaded</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPdfUrl("");
                          setPdfSlidesAllowed("");
                        }}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        disabled={uploading}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-dashed border-border hover:border-primary/50 focus:outline-none cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Slides Allowed (Only when PDF is uploaded) */}
                {pdfUrl && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1">How many slides can buyers read?</label>
                    <input
                      type="number"
                      value={pdfSlidesAllowed}
                      onChange={(e) => setPdfSlidesAllowed(e.target.value)}
                      placeholder="e.g. 5, 10, all"
                      min="1"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                    />
                    <p className="text-xs text-muted-foreground">Buyers will be able to preview this many pages/slides of your PDF</p>
                  </div>
                )}
              </div>
            )}

            {/* Video Upload (Optional) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">Demonstration Video (Optional)</label>
              </div>
              {videoUrl ? (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                  <span className="text-sm text-foreground truncate">Video uploaded</span>
                  <button
                    type="button"
                    onClick={() => setVideoUrl("")}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={uploading}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-dashed border-border hover:border-primary/50 focus:outline-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            disabled={isPending || uploading}
            type="submit"
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-70 transition-all flex items-center justify-center gap-2"
          >
            {isPending || uploading ? <Loader2 className="animate-spin" /> : <Upload className="w-5 h-5" />}
            <span>Post Listing</span>
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
