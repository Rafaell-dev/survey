import { useMemo } from "react";
import { QuestionChartProps } from "../charts/types";
import { parseTextResponses, extractWordFrequencies } from "./utils";
import ReactECharts from "echarts-for-react";

export function WordFrequency({ question, visualization }: QuestionChartProps) {
  const allResponses = useMemo(() => parseTextResponses(question.responses), [question.responses]);
  let wordFrequencies = useMemo(() => extractWordFrequencies(allResponses).slice(0, 15), [allResponses]); // top 15

  if (visualization.sortEnabled) {
    wordFrequencies = wordFrequencies.sort((a, b) => 
      visualization.sortDirection === 'ASC' ? a.count - b.count : b.count - a.count
    );
  } else {
    // Ordem natural ECharts Horizontal (menor para maior fica no topo)
    wordFrequencies = wordFrequencies.sort((a, b) => a.count - b.count);
  }

  if (wordFrequencies.length === 0) {
    return (
      <div className="w-full py-12 text-center text-muted-foreground">
        Não há palavras suficientes para analisar a frequência.
      </div>
    );
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      show: false
    },
    yAxis: {
      type: 'category',
      data: wordFrequencies.map(w => w.word),
      axisLabel: {
        fontWeight: 'bold'
      }
    },
    series: [
      {
        name: 'Ocorrências',
        type: 'bar',
        data: wordFrequencies.map(w => w.count),
        itemStyle: {
          color: '#8b5cf6', // Violet
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}',
          color: '#6b7280'
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
