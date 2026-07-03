import ReactECharts from "echarts-for-react";
import { QuestionChartProps } from "../types";

export default function RadarChart({ question, visualization }: QuestionChartProps) {
  if (!question.options || question.options.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed rounded-md bg-muted/10 text-muted-foreground p-4 text-center">
        <p>Nenhum dado disponível para esta pergunta.</p>
      </div>
    );
  }

  try {
    const isPercentage = visualization.displayMode === 'PERCENTAGE';
    const dataValues = question.options.map(o => isPercentage ? o.percentage : o.count);
    const maxVal = Math.max(...dataValues);

    const legendConfig: any = {
      show: visualization.showLegend && visualization.legendPosition !== 'NONE',
    };
    if (visualization.legendPosition === 'BOTTOM') {
      legendConfig.bottom = 0;
      legendConfig.orient = 'horizontal';
    } else if (visualization.legendPosition === 'RIGHT') {
      legendConfig.right = 0;
      legendConfig.top = 'middle';
      legendConfig.orient = 'vertical';
    }

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          let html = `<div class="font-sans text-sm"><strong>${question.questionTitle}</strong><br/>`;
          params.value.forEach((val: number, idx: number) => {
            const opt = question.options![idx];
            html += `${opt.label}: ${opt.count} (${opt.percentage}%)<br/>`;
          });
          html += `</div>`;
          return html;
        }
      },
      legend: legendConfig,
      radar: {
        indicator: question.options.map(o => ({ 
          name: o.label.length > 20 ? o.label.substring(0, 20) + '...' : o.label, 
          max: maxVal === 0 ? 1 : maxVal * 1.1 // Add 10% headroom
        })),
        shape: 'circle',
        splitNumber: 5,
        axisName: {
          color: '#4b5563',
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: ['#e5e7eb', '#e5e7eb', '#e5e7eb', '#e5e7eb', '#e5e7eb'].reverse()
          }
        },
        splitArea: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      series: [
        {
          name: 'Respostas',
          type: 'radar',
          data: [
            {
              value: dataValues,
              name: 'Resultados'
            }
          ],
          symbolSize: 6,
          itemStyle: {
            color: '#f97316' // Tailwind orange-500
          },
          lineStyle: {
            width: 2
          },
          areaStyle: {
            color: 'rgba(249, 115, 22, 0.3)'
          },
          label: {
            show: visualization.showValues || visualization.showPercentage,
            formatter: (params: any) => {
              return params.value;
            },
            color: '#6b7280'
          }
        }
      ]
    };

    return <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />;
  } catch (err) {
    return (
      <div className="flex items-center justify-center h-48 border border-destructive/20 bg-destructive/5 rounded-md text-destructive p-4 text-center">
        <p>Não foi possível renderizar o gráfico.</p>
      </div>
    );
  }
}
