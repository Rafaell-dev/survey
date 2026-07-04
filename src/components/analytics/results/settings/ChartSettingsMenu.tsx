import { ChartDisplayOptions, DisplayModeOptions, LegendOptions, SortingOptions } from "./options";
import { RestoreVisualizationButton } from "./RestoreVisualizationButton";
import { QuestionVisualization } from "@/domain/analytics.types";

interface ChartSettingsMenuProps {
  visualization: QuestionVisualization;
  onVisualizationChange: (val: QuestionVisualization) => void;
  onRestore: () => void;
}

export function ChartSettingsMenu({ visualization, onVisualizationChange, onRestore }: ChartSettingsMenuProps) {
  return (
    <div className="w-full sm:w-[280px] p-4 max-h-[80vh] overflow-y-auto">
      <h4 className="font-medium text-sm mb-4">Configurações</h4>
      
      <ChartDisplayOptions visualization={visualization} onChange={onVisualizationChange} />

      <div className="h-px w-full bg-border my-4" />

      <SortingOptions visualization={visualization} onChange={onVisualizationChange} />

      <div className="h-px w-full bg-border my-4" />

      <DisplayModeOptions visualization={visualization} onChange={onVisualizationChange} />

      <div className="h-px w-full bg-border my-4" />

      <LegendOptions visualization={visualization} onChange={onVisualizationChange} />

      <div className="h-px w-full bg-border my-4" />

      <RestoreVisualizationButton onRestore={onRestore} />
    </div>
  );
}
