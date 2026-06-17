"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users, LayoutTemplate, Clock, Download, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAxiosError } from "axios";
import { useSurveyStore } from "@/store/survey.store";
import { api } from "@/services/api";

export default function DashboardPage() {
  const { surveys, loading, fetchSurveys, deleteSurvey, total } = useSurveyStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSurveys().catch((err) => {
      toast.error("Erro ao carregar surveys.");
    });
  }, [fetchSurveys]);

  const handleExport = async (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const response = await api.get(`/surveys/${formId}/export/csv`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `survey_${formId}_export.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Download iniciado com sucesso");
    } catch (err) {
      toast.error("Erro ao exportar dados");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteSurvey(deleteId);
      toast.success("Survey removido com sucesso.");
      setDeleteId(null);
    } catch (err: unknown) {
      console.error("Erro na exclusão:", err);
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Erro ao remover survey.");
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao remover survey.");
      }
    }
  };

  const stats = [
    { title: "Total de Formulários", value: total.toString(), icon: LayoutTemplate },
    { title: "Total de Respostas", value: "0", icon: Users },
    { title: "Tempo Médio de Conclusão", value: "0m", icon: Clock },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Painel de Controle</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Visão geral dos seus formulários e atividades recentes.</p>
        </div>
        <Link href="/dashboard/create" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Criar Formulário
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i} className="border-primary/10 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Formulários Recentes</h2>
        
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-full opacity-50 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted w-3/4 mb-2 rounded" />
                  <div className="h-4 bg-muted w-full rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted w-1/2 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : surveys.length === 0 ? (
          <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <LayoutTemplate className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Nenhum formulário encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Você ainda não criou nenhum formulário ou todos foram excluídos. Comece criando seu primeiro survey para coletar respostas.
            </p>
            <Link href="/dashboard/create">
              <Button>Crie seu primeiro formulário</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {surveys.map((survey) => (
              <Link key={survey.id} href={`/dashboard/edit/${survey.id}`}>
                <Card className="group transition-all hover:shadow-md border-primary/10 cursor-pointer h-full flex flex-col">
                  <CardHeader className="flex-1">
                    <div className="flex items-start justify-between">
                      <CardTitle className="truncate pr-4">{survey.title}</CardTitle>
                      
                      <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                        {survey.status === 'PUBLISHED' && (
                          <>
                            {survey.publicSlug && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={(e) => {
                                e.preventDefault();
                                window.open(`/survey/${survey.publicSlug}`, '_blank');
                              }} title="Acessar Formulário Público">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-green-600" onClick={(e) => handleExport(e, survey.id)} title="Baixar Resultados (CSV)">
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setDeleteId(survey.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {survey.description || "Nenhuma descrição fornecida."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
                    <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full ${survey.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : survey.status === 'ARCHIVED' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'}`}>
                      {survey.status === 'PUBLISHED' ? 'Publicado' : survey.status === 'ARCHIVED' ? 'Arquivado' : 'Rascunho'}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-background w-full max-w-md rounded-xl p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-2">Tem certeza absoluta?</h3>
            <p className="text-muted-foreground mb-6">
              Essa ação irá remover ou arquivar este formulário. Respostas vinculadas a ele poderão deixar de ser computadas.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>Sim, excluir</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
