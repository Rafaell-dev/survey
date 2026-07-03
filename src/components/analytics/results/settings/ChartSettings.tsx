import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { QuestionVisualization } from "@/domain/analytics.types";
import { ChartSettingsButton } from "./ChartSettingsButton";
import { ChartSettingsMenu } from "./ChartSettingsMenu";

interface ChartSettingsProps {
  visualization: QuestionVisualization;
  onVisualizationChange: (val: QuestionVisualization) => void;
}

export function ChartSettings({ visualization, onVisualizationChange }: ChartSettingsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ChartSettingsButton />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="p-0 border rounded-xl shadow-lg w-full sm:w-auto">
        <ChartSettingsMenu 
          visualization={visualization} 
          onVisualizationChange={onVisualizationChange} 
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
