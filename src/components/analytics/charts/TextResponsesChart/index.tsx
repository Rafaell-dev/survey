import { QuestionChartProps } from "../types";

export default function TextResponsesChart({ question }: QuestionChartProps) {
  if (!question.responses || !Array.isArray(question.responses) || question.responses.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed rounded-md bg-muted/10 text-muted-foreground p-4 text-center">
        <p>Nenhum dado disponível para esta pergunta.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 border rounded-md p-4 bg-muted/10">
      {question.responses.map((text, i) => (
        <div key={i} className="text-sm border-b last:border-0 pb-3 mb-3 last:pb-0 last:mb-0 text-foreground/90 leading-relaxed">
          "{text}"
        </div>
      ))}
    </div>
  );
}
