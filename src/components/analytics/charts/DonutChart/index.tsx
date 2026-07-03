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
    const options = question.options;
    const totalResponses = options.reduce((sum, opt) => sum + opt.count, 0);

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
          center: ['40%', '50%'],
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
                const parts = [];
                if (visualization.showValues) parts.push(params.value);
                if (visualization.showPercentage) parts.push(`${options[params.dataIndex].percentage}%`);
                return parts.join(' / ');
              }
            }
          },
          labelLine: {
            show: false
          },
          data: options.map(o => ({ value: o.count, name: o.label }))
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
