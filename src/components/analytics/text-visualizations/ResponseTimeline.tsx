import { useMemo } from "react";
import { QuestionChartProps } from "../charts/types";
import { parseTextResponses } from "./utils";
import ReactECharts from "echarts-for-react";

export function ResponseTimeline({ question, visualization }: QuestionChartProps) {
  const allResponses = useMemo(() => parseTextResponses(question.responses), [question.responses]);

  const timelineData = useMemo(() => {
    const countsByDate: Record<string, number> = {};
    
    allResponses.forEach(r => {
      // Agrupando por dia
      const dateStr = new Date(r.date).toLocaleDateString('pt-BR');
      countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
    });

    const entries = Object.entries(countsByDate).map(([date, count]) => ({ date, count }));
    
    // Na timeline a ordem temporal é sempre mais útil, 
    // mas deixamos respeitar a configuração se habilitada
    if (visualization.sortEnabled) {
      return entries.sort((a, b) => 
        visualization.sortDirection === 'ASC' ? a.count - b.count : b.count - a.count
      );
    }
    
    // Se não houver sorting customizado, ordem cronológica
    return entries.sort((a, b) => {
      const [d1, m1, y1] = a.date.split('/');
      const [d2, m2, y2] = b.date.split('/');
      const dateA = new Date(`${y1}-${m1}-${d1}`).getTime();
      const dateB = new Date(`${y2}-${m2}-${d2}`).getTime();
      return dateA - dateB;
    });
  }, [allResponses, visualization.sortEnabled, visualization.sortDirection]);

  if (timelineData.length === 0) {
    return (
      <div className="w-full py-12 text-center text-muted-foreground">
        Não há datas suficientes para exibir a timeline.
      </div>
    );
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timelineData.map(d => d.date),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
    },
    series: [
      {
        name: 'Respostas recebidas',
        type: 'line',
        data: timelineData.map(d => d.count),
        smooth: true,
        symbolSize: 8,
        itemStyle: { color: '#10b981' }, // Emerald
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.4)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
            ]
          }
        }
      }
    ]
  };

  return (
    <div className="w-full h-80">
      <ReactECharts 
        option={option} 
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}
