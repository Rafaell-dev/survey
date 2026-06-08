"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { Plus, Users, LayoutTemplate, Clock, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, API_URL } from "@/services/api";

export default function DashboardPage() {
  const forms = useStore((state) => state.forms);
  const setForms = useStore((state) => state.setForms);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/surveys")
      .then((res) => {
        setForms(res.data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [setForms]);

  const handleExport = async (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
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
    } catch (err) {
      alert("Erro ao exportar dados");
    }
  };

  const stats = [
    { title: "Total de Formulários", value: forms.length.toString(), icon: LayoutTemplate },
    { title: "Total de Respostas", value: "0", icon: Users },
    { title: "Tempo Médio de Conclusão", value: "0m", icon: Clock },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
          <p className="text-muted-foreground">Visão geral dos seus formulários e atividades recentes.</p>
        </div>
        <Link href="/dashboard/create">
          <Button className="gap-2">
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
          <div className="flex justify-center p-12">Carregando formulários...</div>
        ) : forms.length === 0 ? (
          <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <LayoutTemplate className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Nenhum formulário criado</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Você ainda não criou nenhum formulário. Comece criando seu primeiro formulário para coletar respostas.
            </p>
            <Link href="/dashboard/create">
              <Button>Crie seu primeiro formulário</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <Link key={form.id} href={`/dashboard/edit/${form.id}`}>
                <Card className="group transition-all hover:shadow-md border-primary/10 cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="truncate pr-4">{form.title || "Formulário sem título"}</CardTitle>
                      <div className="flex items-center gap-1">
                        {form.status === 'PUBLISHED' && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(`/s/${form.id}`, '_blank');
                            }} title="Acessar Formulário Público">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-green-600" onClick={(e) => { e.preventDefault(); handleExport(e, form.id); }} title="Baixar Resultados (CSV)">
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {form.description || "Nenhuma descrição fornecida."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Atualizado em {new Date(form.updatedAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full ${form.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-secondary text-secondary-foreground'}`}>
                      {form.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
