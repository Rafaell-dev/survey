import { ChartType, QuestionVisualization } from "@/domain/analytics.types";
import { ChartOptionCard } from "./ChartOptionCard";
import { 
  BarChart3, 
  BarChartHorizontal, 
  PieChart, 
  LineChart, 
  AreaChart, 
  Activity, 
  ListOrdered,
  BoxSelect,
  Waves
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChartSelectorMenuProps {
  visualization: QuestionVisualization;
  onVisualizationChange: (val: QuestionVisualization) => void;
}

export function ChartSelectorMenu({ visualization, onVisualizationChange }: ChartSelectorMenuProps) {
  const handleTypeSelect = (chartType: ChartType) => {
    onVisualizationChange({ ...visualization, chartType });
  };

  return (
    <div className="w-full sm:w-[320px] p-4">
      <h4 className="font-medium text-sm mb-3">Visualizar como</h4>
      
      <div className="grid grid-cols-3 gap-2 mb-6">
        <ChartOptionCard 
          type={ChartType.BAR_HORIZONTAL} 
          label="Barra Horizontal" 
          icon={<BarChartHorizontal className="h-5 w-5" />}
          selected={visualization.chartType === ChartType.BAR_HORIZONTAL}
          onSelect={handleTypeSelect}
        />
        <ChartOptionCard 
          type={ChartType.BAR_VERTICAL} 
          label="Barra Vertical" 
          icon={<BarChart3 className="h-5 w-5" />}
          selected={visualization.chartType === ChartType.BAR_VERTICAL}
          onSelect={handleTypeSelect}
        />
        <ChartOptionCard 
          type={ChartType.PIE} 
          label="Pizza" 
          icon={<PieChart className="h-5 w-5" />}
          selected={visualization.chartType === ChartType.PIE}
          onSelect={handleTypeSelect}
        />
        <ChartOptionCard 
          type={ChartType.DONUT} 
          label="Rosca" 
          icon={<PieChart className="h-5 w-5" />}
          selected={visualization.chartType === ChartType.DONUT}
          onSelect={handleTypeSelect}
        />
        <ChartOptionCard 
          type={ChartType.LINE} 
          label="Linha" 
          icon={<LineChart className="h-5 w-5" />}
          selected={visualization.chartType === ChartType.LINE}
          onSelect={handleTypeSelect}
        />
        <ChartOptionCard 
          type={ChartType.AREA} 
          label="Área" 
          icon={<AreaChart className="h-5 w-5" />}
          selected={visualization.chartType === ChartType.AREA}
          onSelect={handleTypeSelect}
        />
        <ChartOptionCard 
          type={ChartType.RADAR} 
          label="Radar" 
          icon={<Activity className="h-5 w-5" />}
          selected={visualization.chartType === ChartType.RADAR}
          onSelect={handleTypeSelect}
        />
        <ChartOptionCard 
          type={ChartType.HISTOGRAM} 
          label="Histograma" 
          icon={<ListOrdered className="h-5 w-5" />}
          selected={visualization.chartType === ChartType.HISTOGRAM}
          onSelect={handleTypeSelect}
        />
        <ChartOptionCard 
          type={ChartType.BOX_PLOT} 
          label="Box Plot" 
          icon={<BoxSelect className="h-5 w-5" />}
          selected={visualization.chartType === ChartType.BOX_PLOT}
          onSelect={handleTypeSelect}
        />
        <ChartOptionCard 
          type={ChartType.VIOLIN} 
          label="Violino" 
          icon={<Waves className="h-5 w-5" />}
          selected={visualization.chartType === ChartType.VIOLIN}
          onSelect={handleTypeSelect}
        />
      </div>

      <div className="h-px w-full bg-border my-4" />
      
      <Button variant="ghost" className="w-full text-muted-foreground text-sm font-normal justify-start px-2" disabled>
        Mais gráficos em breve...
      </Button>
    </div>
  );
}
