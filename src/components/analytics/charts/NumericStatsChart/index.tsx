import { QuestionChartProps } from "../types";

export default function NumericStatsChart({ question }: QuestionChartProps) {
  if (typeof question.average !== 'number' || typeof question.responses !== 'number' || question.responses === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed rounded-md bg-muted/10 text-muted-foreground p-4 text-center">
        <p>Nenhum dado numérico disponível para esta pergunta.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 text-center py-6">
      <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
        <p className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-2">Média</p>
        <p className="text-3xl font-bold text-primary">{question.average}</p>
      </div>
      <div className="bg-muted/40 p-4 rounded-xl border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Mínimo</p>
        <p className="text-2xl font-bold">{question.minimum}</p>
      </div>
      <div className="bg-muted/40 p-4 rounded-xl border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Máximo</p>
        <p className="text-2xl font-bold">{question.maximum}</p>
      </div>
    </div>
  );
}
