import ReactECharts from "echarts-for-react";
import { QuestionChartProps } from "../types";

export default function PieChart({ question, visualization }: QuestionChartProps) {
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
        trigger: 'item',
        formatter: (params: any) => {
          const opt = options[params.dataIndex];
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
        type: 'scroll',
        orient: 'vertical',
        right: 10,
        top: 20,
        bottom: 20,
      },
      series: [
        {
          name: 'Respostas',
          type: 'pie',
          radius: '70%',
          center: ['40%', '50%'],
          data: options.map(o => ({ value: o.count, name: o.label })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: visualization.showPercentage || visualization.showValues,
            formatter: (params: any) => {
              const parts = [];
              if (visualization.showValues) parts.push(params.value);
              if (visualization.showPercentage) parts.push(`${options[params.dataIndex].percentage}%`);
              return parts.join(' / ');
            }
          },
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2
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
