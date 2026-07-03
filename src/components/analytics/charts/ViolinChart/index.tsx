import ReactECharts from "echarts-for-react";
import { QuestionChartProps } from "../types";

// Helper to expand frequencies into raw values array
function getNumericDistribution(options: any[]) {
  const values: number[] = [];
  options.forEach((opt, index) => {
    const val = parseFloat(opt.label);
    const numericVal = isNaN(val) ? index + 1 : val;
    for (let i = 0; i < opt.count; i++) {
      values.push(numericVal);
    }
  });
  return values.sort((a, b) => a - b);
}

// Gaussian Kernel function for KDE
function gaussianKernel(x: number) {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

// Kernel Density Estimation (KDE)
function kde(kernel: (x: number) => number, bandwidth: number, data: number[]) {
  return (x: number) => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += kernel((x - data[i]) / bandwidth);
    }
    return sum / (data.length * bandwidth);
  };
}

export default function ViolinChart({ question, visualization }: QuestionChartProps) {
  if (!question.options || question.options.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed rounded-md bg-muted/10 text-muted-foreground p-4 text-center">
        <p>Nenhum dado numérico disponível para Violino.</p>
      </div>
    );
  }

  try {
    const rawData = getNumericDistribution(question.options);
    if (rawData.length === 0) throw new Error("No data");

    const min = rawData[0];
    const max = rawData[rawData.length - 1];
    
    // Scott's rule of thumb for bandwidth
    const stdDev = Math.sqrt(rawData.reduce((acc, val) => acc + Math.pow(val - (rawData.reduce((a,b)=>a+b,0)/rawData.length), 2), 0) / rawData.length) || 1;
    const bandwidth = 1.06 * stdDev * Math.pow(rawData.length, -0.2) || 0.5;

    const densityFunc = kde(gaussianKernel, bandwidth, rawData);
    
    // Generate density points for the custom polygon
    const pointsCount = 100;
    const step = (max - min) / pointsCount;
    
    const densityData = [];
    let maxDensity = 0;
    
    // Create points with some padding (10% on each side)
    const padding = (max - min) * 0.1 || 1;
    for (let i = min - padding; i <= max + padding; i += step) {
      const d = densityFunc(i);
      if (d > maxDensity) maxDensity = d;
      densityData.push([i, d]);
    }

    // Custom ECharts series rendering
    const renderViolin = (params: any, api: any) => {
      const categoryIndex = api.value(0); // Which violin (we only have 1 here)
      const xPos = api.coord([categoryIndex, 0])[0];
      
      const width = api.size([1, 0])[0] * 0.8; // 80% of category width
      const scale = (width / 2) / maxDensity;

      // Build the polygon path
      const points = [];
      
      // Right side (top to bottom)
      for (let i = densityData.length - 1; i >= 0; i--) {
        const val = densityData[i][0];
        const den = densityData[i][1];
        const yPos = api.coord([0, val])[1];
        points.push([xPos + den * scale, yPos]);
      }
      
      // Left side (bottom to top)
      for (let i = 0; i < densityData.length; i++) {
        const val = densityData[i][0];
        const den = densityData[i][1];
        const yPos = api.coord([0, val])[1];
        points.push([xPos - den * scale, yPos]);
      }

      return {
        type: 'polygon',
        shape: { points },
        style: api.style({
          fill: '#8b5cf6', // Violet 500
          stroke: '#6d28d9', // Violet 700
          lineWidth: 2,
          opacity: 0.7
        })
      };
    };

    const option = {
      tooltip: {
        formatter: () => `<strong>${question.questionTitle}</strong><br/>Distribuição de Densidade`
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['Distribuição'],
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280' }
      },
      yAxis: {
        type: 'value',
        min: min - padding,
        max: max + padding,
        splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } }
      },
      series: [
        {
          name: 'Violino',
          type: 'custom',
          renderItem: renderViolin,
          data: [[0]], // We only have one category at index 0
          encode: {
            x: 0,
            y: [min, max]
          }
        }
      ]
    };

    return <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />;
  } catch (err) {
    console.error(err);
    return (
      <div className="flex items-center justify-center h-48 border border-destructive/20 bg-destructive/5 rounded-md text-destructive p-4 text-center">
        <p>Não foi possível processar o polígono customizado do Violino.</p>
      </div>
    );
  }
}
