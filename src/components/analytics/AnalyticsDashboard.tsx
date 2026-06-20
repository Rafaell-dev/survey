"use client";

import { useEffect } from "react";
import { useAnalyticsStore } from "@/store/analytics.store";
import { MetricCard } from "./MetricCard";
import { QuestionResultCard } from "./QuestionResultCard";
import { TrackingPanel } from "./TrackingPanel";
import { Users, CheckCircle2, TrendingUp, Clock, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ExportPanel } from "./ExportPanel";

export function AnalyticsDashboard({ surveyId }: { surveyId: string }) {
  const { overview, questions, navigation, media, loading, error, loadAnalytics, reset } = useAnalyticsStore();

  useEffect(() => {
    loadAnalytics(surveyId);
    return () => reset();
  }, [surveyId, loadAnalytics, reset]);

  if (loading || !overview || !questions || !navigation || !media) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground animate-in fade-in">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p>Carregando resultados e métricas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md text-center my-8">
        <p>{error}</p>
      </div>
    );
  }

  if (overview.responsesStarted === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
        <div className="bg-muted p-4 rounded-full mb-4">
          <TrendingUp className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Nenhuma resposta ainda</h3>
        <p className="max-w-md mx-auto">
          Este formulário ainda não recebeu nenhuma interação. Compartilhe o link com seu público para começar a coletar dados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Respostas Iniciadas" 
          value={overview.responsesStarted} 
          icon={Users} 
          description={`${overview.participants} participantes únicos`}
        />
        <MetricCard 
          title="Respostas Concluídas" 
          value={overview.responsesCompleted} 
          icon={CheckCircle2} 
        />
        <MetricCard 
          title="Taxa de Conclusão" 
          value={`${overview.completionRate}%`} 
          icon={TrendingUp} 
          description={`${overview.abandonmentRate}% de abandono`}
        />
        <MetricCard 
          title="Tempo Médio" 
          value={`${Math.round(overview.averageTimeMs / 1000)}s`} 
          icon={Clock} 
          description="Para chegar até o fim"
        />
      </div>

      <ExportPanel surveyId={surveyId} />

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger 
            value="results" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Resultados (Respostas)
          </TabsTrigger>
          <TabsTrigger 
            value="tracking" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Tracking (Comportamento)
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="results" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          {questions.questions.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground border-dashed">
              Não há dados de respostas estruturadas para exibir.
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {questions.questions.map((q, i) => (
                <QuestionResultCard key={q.questionId} question={q} index={i} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="tracking" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <TrackingPanel blocks={navigation.blocks} medias={media.medias} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
