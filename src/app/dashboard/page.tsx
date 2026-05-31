"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { Plus, Users, LayoutTemplate, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchApi } from "@/services/api";

export default function DashboardPage() {
  const forms = useStore((state) => state.forms);
  const setForms = useStore((state) => state.setForms);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/surveys")
      .then((data) => {
        setForms(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [setForms]);

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
              <Card key={form.id} className="group transition-all hover:shadow-md border-primary/10 cursor-pointer">
                <CardHeader>
                  <CardTitle className="truncate">{form.title || "Formulário sem título"}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {form.description || "Nenhuma descrição fornecida."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Atualizado em {new Date(form.updatedAt).toLocaleDateString()}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
