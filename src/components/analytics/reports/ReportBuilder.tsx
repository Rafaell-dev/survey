"use client";

import { useState } from "react";
import { useReportStore } from "@/store/report.store";
import { useAnalyticsStore } from "@/store/analytics.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2, LayoutDashboard, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportFilters } from "./ReportFilters";
import { ReportPreview } from "./ReportPreview";

interface ReportBuilderProps {
  surveyId: string;
  onBack: () => void;
}

export function ReportBuilder({ surveyId, onBack }: ReportBuilderProps) {
  const { currentReport, createReport, updateReport, deleteReport } = useReportStore();
  const { questions } = useAnalyticsStore();
  
  const [name, setName] = useState(currentReport?.name || "Novo Relatório");
  const [filters, setFilters] = useState<any>(currentReport?.filters || {
    status: "ALL",
    dateRange: { from: null, to: null },
    selectedQuestions: questions?.questions.map(q => q.questionId) || [],
    showMetrics: true
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("O nome do relatório é obrigatório.");
      return;
    }

    setSaving(true);
    try {
      if (currentReport) {
        await updateReport(surveyId, currentReport.id, { name, filters });
        toast.success("Relatório atualizado com sucesso!");
      } else {
        await createReport(surveyId, { name, filters });
        toast.success("Relatório salvo com sucesso!");
      }
    } catch (err) {
      // error handled in store
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentReport) return;
    if (!confirm("Tem certeza que deseja excluir este relatório?")) return;
    
    try {
      await deleteReport(surveyId, currentReport.id);
      toast.success("Relatório excluído com sucesso!");
      onBack();
    } catch (err) {
      // error handled in store
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 border rounded-lg">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do Relatório"
            className="text-lg font-bold border-transparent focus-visible:border-primary px-2 w-[300px]"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {currentReport && (
            <Button variant="destructive" size="icon" onClick={handleDelete} title="Excluir">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Relatório
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="preview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Visualização
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Configuração e Filtros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-0">
          <ReportPreview filters={filters} />
        </TabsContent>

        <TabsContent value="config" className="mt-0">
          <ReportFilters filters={filters} onChange={setFilters} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
