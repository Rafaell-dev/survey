import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import React from "react";

interface ChartSettingsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const ChartSettingsButton = React.forwardRef<HTMLButtonElement, ChartSettingsButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button 
        ref={ref}
        variant="outline" 
        size="icon" 
        className={`h-8 w-8 text-muted-foreground hover:text-foreground ${className || ''}`}
        title="Configurações"
        {...props}
      >
        <Settings className="h-2 w-2" />
      </Button>
    );
  }
);

ChartSettingsButton.displayName = "ChartSettingsButton";
