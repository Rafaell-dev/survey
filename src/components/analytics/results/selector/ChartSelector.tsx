import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { QuestionVisualization } from "@/domain/analytics.types";
import { ChartSelectorButton } from "./ChartSelectorButton";
import { ChartSelectorMenu } from "./ChartSelectorMenu";

interface ChartSelectorProps {
  visualization: QuestionVisualization;
  onVisualizationChange: (val: QuestionVisualization) => void;
}

export function ChartSelector({ visualization, onVisualizationChange }: ChartSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ChartSelectorButton />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="p-0 border rounded-xl shadow-lg w-full sm:w-auto">
        <ChartSelectorMenu 
          visualization={visualization} 
          onVisualizationChange={onVisualizationChange} 
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
