import ReactECharts from "echarts-for-react";
import { QuestionChartProps } from "../types";

// Função para extrair array de valores brutos a partir das frequências das opções
// (Supondo que os labels das opções numéricas possam ser convertidos para números, ou usamos os índices)
function getNumericDistribution(options: any[]) {
  const values: number[] = [];
  options.forEach((opt, index) => {
    // Tenta parsear o label para número (se for slider/likert), senão usa o índice
    const val = parseFloat(opt.label);
    const numericVal = isNaN(val) ? index + 1 : val;
    for (let i = 0; i < opt.count; i++) {
      values.push(numericVal);
    }
  });
  return values.sort((a, b) => a - b);
}

function quantile(sorted: number[], q: number) {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

export default function BoxPlotChart({ question, visualization }: QuestionChartProps) {
  if (!question.options || question.options.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed rounded-md bg-muted/10 text-muted-foreground p-4 text-center">
        <p>Nenhum dado disponível para o Box Plot.</p>
      </div>
    );
  }

  try {
    const sortedVals = getNumericDistribution(question.options);
    
    let boxData = [];
    if (sortedVals.length > 0) {
      const min = sortedVals[0];
      const q1 = quantile(sortedVals, 0.25);
      const median = quantile(sortedVals, 0.5);
      const q3 = quantile(sortedVals, 0.75);
      const max = sortedVals[sortedVals.length - 1];
      boxData = [[min, q1, median, q3, max]];
    }

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const [min, q1, median, q3, max] = params.data.slice(1);
          return `
            <div class="font-sans text-sm">
              <strong>${question.questionTitle}</strong><br/>
              Máximo: ${max}<br/>
              Q3: ${q3}<br/>
              Mediana: ${median}<br/>
              Q1: ${q1}<br/>
              Mínimo: ${min}
            </div>
          `;
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['Distribuição'],
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { show: false },
        axisLabel: { color: '#6b7280' }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } }
      },
      series: [
        {
          name: 'Box Plot',
          type: 'boxplot',
          data: boxData,
          itemStyle: {
            color: '#e2e8f0',
            borderColor: '#64748b',
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
