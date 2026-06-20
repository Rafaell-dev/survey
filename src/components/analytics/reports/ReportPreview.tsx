"use client";

import { useAnalyticsStore } from "@/store/analytics.store";
import { MetricCard } from "../MetricCard";
import { QuestionResultCard } from "../QuestionResultCard";
import { Users, CheckCircle2, TrendingUp, Clock } from "lucide-react";

export function ReportPreview({ filters }: { filters: any }) {
  const { overview, questions } = useAnalyticsStore();

  if (!overview || !questions) return null;

  // Filtragem básica no frontend com base nas flags
  const selectedQuestions = questions.questions.filter(q => 
    (filters.selectedQuestions || []).includes(q.questionId)
  );

  const formatTime = (ms: number) => {
    const totalSeconds = Math.round(ms / 1000);
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {filters.showMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Respostas" 
            value={filters.status === 'COMPLETED' ? overview.responsesCompleted : overview.responsesStarted} 
            icon={Users} 
            description={filters.status === 'COMPLETED' ? "Total finalizadas" : "Total registradas"}
          />
          <MetricCard 
            title="Taxa de Conclusão" 
            value={`${overview.completionRate}%`} 
            icon={TrendingUp} 
          />
          <MetricCard 
            title="Tempo Médio" 
            value={formatTime(overview.averageTimeMs)} 
            icon={Clock} 
          />
          <MetricCard 
            title="Participantes" 
            value={overview.participants} 
            icon={CheckCircle2} 
            description="Únicos"
          />
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Análise de Respostas</h3>
        {selectedQuestions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground border-dashed border-2 rounded-lg">
            Nenhuma pergunta selecionada para este relatório.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedQuestions.map((q, i) => (
              <QuestionResultCard key={q.questionId} question={q} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
