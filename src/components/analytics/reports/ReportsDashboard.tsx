"use client";

import { useEffect, useState } from "react";
import { useReportStore } from "@/store/report.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Loader2, ArrowRight } from "lucide-react";
import { ReportBuilder } from "./ReportBuilder";

export function ReportsDashboard({ surveyId }: { surveyId: string }) {
  const { reports, loadReports, loading, currentReport, setCurrentReport } = useReportStore();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadReports(surveyId);
  }, [surveyId, loadReports]);

  if (isCreating || currentReport) {
    return (
      <ReportBuilder 
        surveyId={surveyId} 
        onBack={() => {
          setIsCreating(false);
          setCurrentReport(null);
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Meus Relatórios
          </h2>
          <p className="text-sm text-muted-foreground">
            Crie visões customizadas filtrando os resultados do seu formulário.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Relatório
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="bg-muted p-4 rounded-full mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum relatório criado</h3>
            <p className="max-w-sm mb-6">
              Você ainda não possui relatórios personalizados para este formulário.
            </p>
            <Button onClick={() => setIsCreating(true)} variant="outline">
              Criar meu primeiro relatório
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Card 
              key={report.id} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setCurrentReport(report)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{report.name}</CardTitle>
                <CardDescription>
                  Atualizado em {new Date(report.updatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-primary font-medium">
                  Abrir relatório <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
