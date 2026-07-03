import { Button } from "@/components/ui/button";
import { BarChart3, ChevronDown } from "lucide-react";
import React from "react";

interface ChartSelectorButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const ChartSelectorButton = React.forwardRef<HTMLButtonElement, ChartSelectorButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button 
        ref={ref}
        variant="outline" 
        size="sm" 
        className={`gap-2 ${className || ''}`}
        {...props}
      >
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <span>Visualização</span>
        <ChevronDown className="h-3 w-3 opacity-50" />
      </Button>
    );
  }
);

ChartSelectorButton.displayName = "ChartSelectorButton";
