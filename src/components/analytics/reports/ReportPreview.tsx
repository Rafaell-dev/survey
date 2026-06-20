"use client";

import { useAnalyticsStore } from "@/store/analytics.store";
import { Users, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import { ReportMetricCard } from "./visualizations/ReportMetricCard";
import { ReportChart } from "./visualizations/ReportChart";
import { ReportTable } from "./visualizations/ReportTable";

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
          <ReportMetricCard 
            metric={{
              id: "resp",
              label: "Respostas",
              value: filters.status === 'COMPLETED' ? overview.responsesCompleted : overview.responsesStarted,
              description: filters.status === 'COMPLETED' ? "Total finalizadas" : "Total registradas",
              type: "number"
            }}
            icon={Users} 
          />
          <ReportMetricCard 
            metric={{
              id: "taxa",
              label: "Taxa de Conclusão",
              value: `${overview.completionRate}%`,
              type: "percentage"
            }}
            icon={TrendingUp} 
          />
          <ReportMetricCard 
            metric={{
              id: "tempo",
              label: "Tempo Médio",
              value: formatTime(overview.averageTimeMs),
              type: "time"
            }}
            icon={Clock} 
          />
          <ReportMetricCard 
            metric={{
              id: "part",
              label: "Participantes",
              value: overview.participants,
              description: "Únicos",
              type: "number"
            }}
            icon={CheckCircle2} 
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
            {selectedQuestions.map((q) => (
              q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE' ? (
                <ReportChart key={q.questionId} data={q} />
              ) : (
                <ReportTable key={q.questionId} data={q} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
