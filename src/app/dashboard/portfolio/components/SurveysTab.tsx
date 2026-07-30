"use client";

import { useEffect } from "react";
import { useSurveyStore } from "@/store/survey.store";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, LayoutTemplate, Star } from "lucide-react";
import { toast } from "sonner";

export function SurveysTab() {
  const { surveys, loading, fetchSurveys, toggleHighlight } = useSurveyStore();

  useEffect(() => {
    fetchSurveys().catch(() => toast.error("Erro ao carregar pesquisas."));
  }, [fetchSurveys]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Apenas pesquisas publicadas podem ser destacadas no portfólio
  const publishedSurveys = surveys.filter((s) => s.status === "PUBLISHED");

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          Pesquisas em Destaque
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione quais das suas pesquisas publicadas devem aparecer no seu
          perfil público.
        </p>
      </div>

      {publishedSurveys.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <LayoutTemplate className="h-8 w-8 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">
              Nenhuma pesquisa publicada
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              Você precisa publicar uma pesquisa primeiro para poder destacá-la
              no seu portfólio.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {publishedSurveys.map((survey) => (
            <div
              key={survey.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-card hover:border-primary/30 transition-colors"
            >
              <div className="flex-1 pr-4">
                <h3 className="font-medium">{survey.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  {survey.description || "Sem descrição"}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 pl-4 border-l">
                <span className="text-sm font-medium text-muted-foreground">
                  {survey.isHighlighted ? "Destacada" : "Oculta"}
                </span>
                <Switch
                  checked={!!survey.isHighlighted}
                  onCheckedChange={(checked) =>
                    toggleHighlight(survey.id, !checked)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
