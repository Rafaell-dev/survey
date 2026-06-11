"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useSurveyPlayerStore } from "@/store/survey-player.store";
import { SurveyPlayer } from "@/components/player/SurveyPlayer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PublicSurveyPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { loadSurvey, loading, error } = useSurveyPlayerStore();

  useEffect(() => {
    if (slug) {
      loadSurvey(slug);
    }
  }, [slug, loadSurvey]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background/50">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Carregando pesquisa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Alert variant="destructive" className="max-w-md w-full">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Ops! Algo deu errado.</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      <SurveyPlayer />
    </main>
  );
}
