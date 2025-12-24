import { cn } from "@/lib/utils";

interface CategoryPillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function CategoryPill({ label, isActive, onClick }: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 active:scale-95",
        isActive
          ? "gradient-primary text-white shadow-md-elevation shadow-primary/30 scale-105 border border-primary/20"
          : "bg-white text-muted-foreground border border-border/60 hover:border-primary/40 hover:bg-muted/30 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
