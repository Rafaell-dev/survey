import { QuestionAnalyticsDTO } from "@/domain/analytics.types";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface Props {
  question: QuestionAnalyticsDTO;
}

export function PerceptionTestRenderer({ question }: Props) {
  const responses = question.responses || [];

  // Analisa as strings JSON do banco e nivela em uma lista única
  const allInteractions: any[] = [];
  
  responses.forEach((responseObj) => {
    // responseObj pode ser o próprio objeto de resposta { answerId, textValue, etc } dependendo de como o backend retorna
    // Vamos assumir que é a string ou um objeto com a string
    const rawText = typeof responseObj === 'string' ? responseObj : responseObj.textValue || responseObj.value || responseObj;
    
    if (typeof rawText === 'string') {
      try {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed)) {
          allInteractions.push(...parsed);
        }
      } catch (e) {
        // Ignora JSONs inválidos
      }
    }
  });

  // Ordena cronologicamente
  allInteractions.sort((a, b) => (a.timeOffsetMs || 0) - (b.timeOffsetMs || 0));

  if (allInteractions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground w-full">
        <p>Nenhuma interação registrada para este teste.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-4">
      <div className="text-sm text-muted-foreground mb-4">
        Exibindo {allInteractions.length} interação(ões) registrada(s) cronologicamente.
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-semibold border-b">
          <div className="col-span-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Tempo do Vídeo
          </div>
          <div className="col-span-9">Resposta / Observação</div>
        </div>
        
        <div className="divide-y max-h-[400px] overflow-y-auto">
          {allInteractions.map((int, i) => (
            <div key={i} className="grid grid-cols-12 p-3 text-sm hover:bg-muted/30 transition-colors">
              <div className="col-span-3 font-mono text-muted-foreground">
                {int.timeOffsetMs ? (int.timeOffsetMs / 1000).toFixed(1) + 's' : '-'}
              </div>
              <div className="col-span-9 font-medium">
                {int.answer || "-"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
