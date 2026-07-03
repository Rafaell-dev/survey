import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface RestoreVisualizationButtonProps {
  onRestore: () => void;
}

export function RestoreVisualizationButton({ onRestore }: RestoreVisualizationButtonProps) {
  return (
    <div className="pt-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive gap-2 font-normal"
        onClick={onRestore}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Restaurar padrão
      </Button>
    </div>
  );
}
