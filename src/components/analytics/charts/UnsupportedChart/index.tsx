import { QuestionChartProps } from "../types";

export default function UnsupportedChart({ visualization }: QuestionChartProps) {
  return (
    <div className="flex items-center justify-center h-48 border border-dashed rounded-md bg-muted/20 text-muted-foreground p-4 text-center">
      <p>A visualização <strong>{visualization.chartType}</strong> ainda não está disponível.</p>
    </div>
  );
}
