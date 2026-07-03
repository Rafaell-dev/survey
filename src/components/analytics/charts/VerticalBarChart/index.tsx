import ReactECharts from "echarts-for-react";
import { QuestionChartProps } from "../types";

export default function VerticalBarChart({ question, visualization }: QuestionChartProps) {
  if (!question.options || question.options.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed rounded-md bg-muted/10 text-muted-foreground p-4 text-center">
        <p>Nenhum dado disponível para esta pergunta.</p>
      </div>
    );
  }

  try {
    const options = question.options;

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0];
          const opt = options[data.dataIndex];
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
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: options.map(o => o.label),
        axisLabel: { 
          width: 80, 
          overflow: 'truncate',
          interval: 0,
          rotate: options.length > 5 ? 45 : 0,
          color: '#6b7280'
        },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e5e7eb' } }
      },
      yAxis: {
        type: 'value',
        show: visualization.showValues,
        axisLine: { show: false },
        splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } }
      },
      series: [
        {
          name: 'Respostas',
          type: 'bar',
          data: options.map(o => o.count),
          barMaxWidth: 60,
          itemStyle: {
            color: '#3b82f6', // Tailwind blue-500
            borderRadius: [4, 4, 0, 0]
          },
          label: {
            show: visualization.showPercentage,
            position: 'top',
            formatter: (params: any) => {
              const opt = options[params.dataIndex];
              return `${opt.percentage}%`;
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
