import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Loader2, ChevronUp, ChevronDown } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  maxPages: number;
  onLoadComplete?: () => void;
}

export function PDFViewer({ pdfUrl, maxPages, onLoadComplete }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch the PDF
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error("Failed to load PDF");
        const arrayBuffer = await response.arrayBuffer();

        // Load with pdf.js
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setTotalPages(Math.min(pdf.numPages, maxPages));

        // Clear container
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        // Render pages
        for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, maxPages); pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          if (context) {
            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;
          }

          // Create a wrapper div for the page
          const pageDiv = document.createElement("div");
          pageDiv.className = "mb-4 bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-border shadow-sm";
          pageDiv.appendChild(canvas);

          // Add page number label
          const pageLabel = document.createElement("div");
          pageLabel.className = "text-center text-xs text-muted-foreground py-2 bg-muted/50";
          pageLabel.textContent = `Page ${pageNum}`;
          pageDiv.appendChild(pageLabel);

          containerRef.current?.appendChild(pageDiv);
        }

        setIsLoading(false);
        onLoadComplete?.();
      } catch (err) {
        console.error("PDF loading error:", err);
        setError(err instanceof Error ? err.message : "Failed to load PDF");
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl, maxPages, onLoadComplete]);

  const scroll = (direction: "up" | "down") => {
    if (containerRef.current) {
      const scrollAmount = 300;
      containerRef.current.scrollBy({
        top: direction === "down" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-red-600">
        <p className="font-semibold mb-2">Error Loading PDF</p>
        <p className="text-sm text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted/20">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Rendering PDF...</p>
          </div>
        </div>
      )}

      {/* Scroll Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-2 py-4 scroll-smooth"
        style={{
          scrollBehavior: "smooth",
        }}
      />

      {/* Navigation Controls */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between gap-2 p-3 border-t border-border bg-background">
          <button
            onClick={() => scroll("up")}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            data-testid="button-scroll-up"
            title="Scroll up"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {totalPages} page{totalPages !== 1 ? "s" : ""}
          </div>

          <button
            onClick={() => scroll("down")}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            data-testid="button-scroll-down"
            title="Scroll down"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
