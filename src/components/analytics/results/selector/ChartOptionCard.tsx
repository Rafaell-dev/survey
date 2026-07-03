import { ChartType } from "@/domain/analytics.types";
import { cn } from "@/lib/utils";

interface ChartOptionCardProps {
  type: ChartType;
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: (type: ChartType) => void;
  disabled?: boolean;
}

export function ChartOptionCard({ 
  type, 
  label, 
  icon, 
  selected, 
  onSelect, 
  disabled = false 
}: ChartOptionCardProps) {
  return (
    <button
      onClick={() => !disabled && onSelect(type)}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center p-3 rounded-md border text-center transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected 
          ? "border-primary bg-primary/10 text-primary" 
          : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        disabled && "opacity-50 cursor-not-allowed hover:bg-card hover:text-muted-foreground"
      )}
    >
      <div className="mb-2">
        {icon}
      </div>
      <span className="text-xs font-medium leading-tight">
        {label}
      </span>
    </button>
  );
}
