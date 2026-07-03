import { QuestionChartProps } from "../types";

export default function ViolinChart({ visualization }: QuestionChartProps) {
  return (
    <div className="flex items-center justify-center h-48 border border-dashed rounded-md bg-muted/10 text-muted-foreground">
      <p>Gráfico em desenvolvimento (<strong>{visualization.chartType}</strong>)</p>
    </div>
  );
}
