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
        className={`h-8 text-xs px-2.5 gap-1.5 ${className || ''}`}
        {...props}
      >
        <BarChart3 className="h-2 w-2 text-muted-foreground" />
        <span>Visualização</span>
        <ChevronDown className="h-2 w-2 opacity-50" />
      </Button>
    );
  }
);

ChartSelectorButton.displayName = "ChartSelectorButton";
