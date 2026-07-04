import dynamic from "next/dynamic";
import { ChartType, QuestionAnalyticsDTO, QuestionVisualization } from "@/domain/analytics.types";
import { Loader2 } from "lucide-react";
import { ChartDataTable } from "../charts/ChartDataTable";

interface QuestionChartRendererProps {
  question: QuestionAnalyticsDTO;
  visualization: QuestionVisualization;
}

// Fallback visual enquanto o código do componente de gráfico está sendo baixado
const ChartLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-48 bg-muted/10 rounded-md">
    <Loader2 className="h-6 w-6 animate-spin text-primary opacity-50 mb-2" />
    <span className="text-xs text-muted-foreground">Carregando visualização...</span>
  </div>
);

// Dynamic Imports: Lazy loading dos gráficos individualmente
const HorizontalBarChart = dynamic(() => import("../charts/HorizontalBarChart"), { loading: ChartLoadingFallback });
const VerticalBarChart = dynamic(() => import("../charts/VerticalBarChart"), { loading: ChartLoadingFallback });
const PieChart = dynamic(() => import("../charts/PieChart"), { loading: ChartLoadingFallback });
const DonutChart = dynamic(() => import("../charts/DonutChart"), { loading: ChartLoadingFallback });
const LineChart = dynamic(() => import("../charts/LineChart"), { loading: ChartLoadingFallback });
const AreaChart = dynamic(() => import("../charts/AreaChart"), { loading: ChartLoadingFallback });
const RadarChart = dynamic(() => import("../charts/RadarChart"), { loading: ChartLoadingFallback });
const HistogramChart = dynamic(() => import("../charts/HistogramChart"), { loading: ChartLoadingFallback });
const BoxPlotChart = dynamic(() => import("../charts/BoxPlotChart"), { loading: ChartLoadingFallback });
const ViolinChart = dynamic(() => import("../charts/ViolinChart"), { loading: ChartLoadingFallback });
const UnsupportedChart = dynamic(() => import("../charts/UnsupportedChart"), { loading: ChartLoadingFallback });
const TextResponsesChart = dynamic(() => import("../charts/TextResponsesChart"), { loading: ChartLoadingFallback });
const NumericStatsChart = dynamic(() => import("../charts/NumericStatsChart"), { loading: ChartLoadingFallback });

export function QuestionChartRenderer({ question, visualization }: QuestionChartRendererProps) {
  const chartProps = { question, visualization };

  // 1. Tratamento para tipos específicos que não suportam gráficos convencionais 
  // (ou para atuar como fallback caso um gráfico padrão ainda não esteja pronto)
  if (question.type === 'SHORT_TEXT' || question.type === 'LONG_TEXT') {
    return <TextResponsesChart {...chartProps} />;
  }

  // Removido o bypass forçado para que os gráficos selecionados funcionem
  // O NumericStatsChart agora é uma opção no Menu e no Switch

  // 2. Roteamento de Gráficos ECharts
  // Função helper para englobar os gráficos na tabela (caso ela deva ser mostrada)
  const withTable = (ChartComponent: React.ComponentType<any>) => (
    <div className="flex flex-col w-full">
      <ChartComponent {...chartProps} />
      <ChartDataTable {...chartProps} />
    </div>
  );

  switch (visualization.chartType) {
    case ChartType.BAR_HORIZONTAL:
      return withTable(HorizontalBarChart);
    
    case ChartType.BAR_VERTICAL:
      return withTable(VerticalBarChart);
      
    case ChartType.PIE:
      return withTable(PieChart);
      
    case ChartType.DONUT:
      return withTable(DonutChart);
      
    case ChartType.LINE:
      return withTable(LineChart);
      
    case ChartType.AREA:
      return withTable(AreaChart);
      
    case ChartType.RADAR:
      return withTable(RadarChart);
      
    case ChartType.HISTOGRAM:
      return withTable(HistogramChart);
      
    case ChartType.BOX_PLOT:
      return withTable(BoxPlotChart);
      
    case ChartType.VIOLIN:
      return withTable(ViolinChart);
      
    case ChartType.NUMERIC_STATS:
      return <NumericStatsChart {...chartProps} />;
      
    default:
      // Fallback para numéricos se não houver opção válida selecionada e cair no default
      if (question.type === 'LIKERT' || question.type === 'SLIDER') {
         return <NumericStatsChart {...chartProps} />;
      }
      return withTable(UnsupportedChart);
  }
}
