import ReactECharts from "echarts-for-react";
import { QuestionChartProps } from "../types";

export default function DonutChart({ question, visualization }: QuestionChartProps) {
  if (!question.options || question.options.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed rounded-md bg-muted/10 text-muted-foreground p-4 text-center">
        <p>Nenhum dado disponível para esta pergunta.</p>
      </div>
    );
  }

  try {
    // 1. Sorting
    let sortedOptions = [...question.options];
    if (visualization.sortEnabled) {
      sortedOptions = sortedOptions.sort((a, b) => 
        visualization.sortDirection === 'ASC' ? a.count - b.count : b.count - a.count
      );
    }

    // 2. Legend Position
    const legendConfig: any = {
      show: visualization.showLegend && visualization.legendPosition !== 'NONE',
      type: 'scroll'
    };
    if (visualization.legendPosition === 'BOTTOM') {
      legendConfig.bottom = 0;
      legendConfig.orient = 'horizontal';
      legendConfig.left = 'center';
    } else if (visualization.legendPosition === 'RIGHT') {
      legendConfig.right = 10;
      legendConfig.top = 'middle';
      legendConfig.orient = 'vertical';
    }

    const totalResponses = sortedOptions.reduce((sum, opt) => sum + opt.count, 0);

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const opt = sortedOptions[params.dataIndex];
          return `
            <div class="font-sans text-sm">
              <strong>${opt.label}</strong><br/>
              Respostas: ${opt.count}<br/>
              Percentual: ${opt.percentage}%
            </div>
          `;
        }
      },
      legend: legendConfig,
      title: {
        text: totalResponses.toString(),
        subtext: 'Respostas',
        left: '40%',
        top: 'center',
        textAlign: 'center',
        textStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#374151'
        },
        subtextStyle: {
          fontSize: 12,
          color: '#6b7280'
        }
      },
      series: [
        {
          name: 'Respostas',
          type: 'pie',
          radius: ['45%', '70%'],
          center: visualization.legendPosition === 'RIGHT' ? ['40%', '50%'] : ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false, // Donut charts usually don't show labels on slices to keep it clean, but let's respect user settings if needed
          },
          emphasis: {
            label: {
              show: visualization.showPercentage || visualization.showValues,
              fontSize: '14',
              fontWeight: 'bold',
              formatter: (params: any) => {
                const opt = sortedOptions[params.dataIndex];
                const parts: string[] = [];
                if (visualization.showValues) parts.push(String(opt.count));
                if (visualization.showPercentage) parts.push(`${opt.percentage}%`);
                return parts.join(' / ');
              }
            }
          },
          labelLine: {
            show: false
          },
          data: sortedOptions.map(o => ({ value: o.count, name: o.label }))
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
