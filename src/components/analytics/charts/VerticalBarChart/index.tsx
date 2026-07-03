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
    // 1. Sorting
    let sortedOptions = [...question.options];
    if (visualization.sortEnabled) {
      sortedOptions = sortedOptions.sort((a, b) => 
        visualization.sortDirection === 'ASC' ? a.count - b.count : b.count - a.count
      );
    }

    // 2. Display Mode (Escala)
    const isPercentage = visualization.displayMode === 'PERCENTAGE';
    const dataValues = sortedOptions.map(o => isPercentage ? o.percentage : o.count);

    // 3. Legend Position
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
      legend: legendConfig,
      grid: {
        left: '3%',
        right: visualization.legendPosition === 'RIGHT' ? '15%' : '4%',
        bottom: visualization.legendPosition === 'BOTTOM' ? '15%' : '10%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: sortedOptions.map(o => o.label),
        axisLabel: { 
          width: 80, 
          overflow: 'truncate',
          interval: 0,
          rotate: sortedOptions.length > 5 ? 45 : 0,
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
          data: dataValues,
          barMaxWidth: 60,
          itemStyle: {
            color: '#3b82f6', // Tailwind blue-500
            borderRadius: [4, 4, 0, 0]
          },
          label: {
            show: visualization.showValues || visualization.showPercentage,
            position: 'top',
            formatter: (params: any) => {
              const opt = sortedOptions[params.dataIndex];
              const parts = [];
              if (visualization.showValues) parts.push(opt.count);
              if (visualization.showPercentage) parts.push(`${opt.percentage}%`);
              return parts.join(' / ');
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
