import { Smile } from "lucide-react";
import { QuestionChartProps } from "../charts/types";

export function SentimentAnalysis(props: QuestionChartProps) {
  return (
    <div className="w-full h-64 flex flex-col items-center justify-center bg-muted/30 rounded-xl border border-dashed border-primary/20 text-center p-6 mt-4">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
        <Smile className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-foreground text-lg mb-2">Análise de Sentimento</h3>
      <p className="text-muted-foreground max-w-sm">
        Esta funcionalidade estará disponível em uma próxima versão, classificando as respostas automaticamente como Positivas, Neutras ou Negativas.
      </p>
    </div>
  );
}
