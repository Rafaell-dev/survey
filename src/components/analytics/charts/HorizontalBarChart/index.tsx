import ReactECharts from "echarts-for-react";
import { QuestionChartProps } from "../types";

export default function HorizontalBarChart({ question, visualization }: QuestionChartProps) {
  if (!question.options || question.options.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed rounded-md bg-muted/10 text-muted-foreground p-4 text-center">
        <p>Nenhum dado disponível para esta pergunta.</p>
      </div>
    );
  }

  try {
    // Ordenar opções do maior para o menor
    const sortedOptions = [...question.options].sort((a, b) => a.count - b.count);

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0];
          const opt = sortedOptions[data.dataIndex];
          return `
            <div class="font-sans text-sm">
              <strong>${opt.label}</strong><br/>
              Respostas: ${opt.count}<br/>
              Percentual: ${opt.percentage}%
            </div>
          `;
        }
      },
      legend: {
        show: visualization.showLegend,
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        show: visualization.showValues,
        axisLine: { show: false },
        splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } }
      },
      yAxis: {
        type: 'category',
        data: sortedOptions.map(o => o.label),
        axisLabel: { 
          width: 150, 
          overflow: 'truncate',
          color: '#6b7280'
        },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e5e7eb' } }
      },
      series: [
        {
          name: 'Respostas',
          type: 'bar',
          data: sortedOptions.map(o => o.count),
          itemStyle: {
            color: '#3b82f6', // Tailwind blue-500
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: visualization.showPercentage,
            position: 'right',
            formatter: (params: any) => {
              const opt = sortedOptions[params.dataIndex];
              return `${opt.percentage}%`;
            },
            color: '#6b7280'
          }
        }
      ]
    };

    return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />;
  } catch (err) {
    return (
      <div className="flex items-center justify-center h-48 border border-destructive/20 bg-destructive/5 rounded-md text-destructive p-4 text-center">
        <p>Não foi possível renderizar o gráfico.</p>
      </div>
    );
  }
}
