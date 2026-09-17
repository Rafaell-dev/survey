"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useSurveyPlayerStore } from "@/store/survey-player.store";
import { SurveyPlayer } from "@/components/player/SurveyPlayer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PreviewSurveyPage() {
  const params = useParams();
  const id = params.id as string;
  const { loadPreview, loading, error } = useSurveyPlayerStore();

  useEffect(() => {
    if (id) {
      loadPreview(id);
    }
  }, [id, loadPreview]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background/50">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Carregando preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-background">
        <Alert variant="destructive" className="max-w-md w-full">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Ops! Algo deu errado.</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
          </AlertDescription>
          <div className="mt-4">
            <Link href={`/dashboard/edit/${id}`}>
              <Button variant="outline" className="w-full text-foreground hover:bg-muted">Voltar para Edição</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] flex flex-col bg-background relative -mt-8 -mx-8 -mb-8">
      <div className="absolute top-4 left-4 z-50">
        <Link href={`/dashboard/edit/${id}`}>
          <Button variant="secondary" size="sm" className="gap-2 shadow-md">
            <ArrowLeft className="h-4 w-4" /> Voltar à Edição
          </Button>
        </Link>
      </div>
      <div className="absolute top-4 right-4 z-50 pointer-events-none">
        <div className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium shadow-sm border border-amber-200 uppercase tracking-wide">
          Modo Visualização
        </div>
      </div>
      <main className="flex-1 bg-background text-foreground py-4 sm:py-8 px-3 sm:px-6 lg:px-8 mt-12 pt-8">
        <SurveyPlayer />
      </main>
    </div>
  );
}
