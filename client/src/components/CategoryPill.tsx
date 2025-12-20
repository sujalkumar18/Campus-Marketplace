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
        "px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300",
        isActive
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
          : "bg-white text-muted-foreground border border-border hover:border-primary/20 hover:bg-primary/5"
      )}
    >
      {label}
    </button>
  );
}
