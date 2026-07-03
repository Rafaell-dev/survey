import ReactECharts from "echarts-for-react";
import { QuestionChartProps } from "../types";

export default function HistogramChart({ question, visualization }: QuestionChartProps) {
  if (!question.options || question.options.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed rounded-md bg-muted/10 text-muted-foreground p-4 text-center">
        <p>Nenhum dado disponível para o Histograma.</p>
      </div>
    );
  }

  try {
    let sortedOptions = [...question.options];
    if (visualization.sortEnabled) {
      sortedOptions = sortedOptions.sort((a, b) => 
        visualization.sortDirection === 'ASC' ? a.count - b.count : b.count - a.count
      );
    }

    const isPercentage = visualization.displayMode === 'PERCENTAGE';
    const dataValues = sortedOptions.map(o => isPercentage ? o.percentage : o.count);

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const opt = sortedOptions[params[0].dataIndex];
          return `<div class="font-sans text-sm">
            <strong>${opt.label}</strong><br/>
            Frequência: ${opt.count} (${opt.percentage}%)
          </div>`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: sortedOptions.map(o => o.label),
        axisTick: { alignWithLabel: true },
        axisLabel: { 
          color: '#6b7280',
          rotate: sortedOptions.length > 5 ? 45 : 0
        },
        axisLine: { lineStyle: { color: '#e5e7eb' } }
      },
      yAxis: {
        type: 'value',
        show: visualization.showValues,
        splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } }
      },
      series: [
        {
          name: 'Frequência',
          type: 'bar',
          barWidth: '99.5%', // Simulate histogram continuous bins
          data: dataValues,
          itemStyle: {
            color: '#3b82f6',
            borderColor: '#ffffff',
            borderWidth: 1
          },
          label: {
            show: visualization.showValues || visualization.showPercentage,
            position: 'top',
            formatter: (params: any) => {
              const opt = sortedOptions[params.dataIndex];
              return visualization.showPercentage ? `${opt.percentage}%` : opt.count;
            },
            color: '#6b7280'
          }
        }
      ]
    };

    return <ReactECharts option={option} style={{ height: '350px', width: '100%' }} />;
  } catch (err) {
    return (
      <div className="flex items-center justify-center h-48 border border-destructive/20 bg-destructive/5 rounded-md text-destructive p-4 text-center">
        <p>Não foi possível renderizar o gráfico.</p>
      </div>
    );
  }
}
