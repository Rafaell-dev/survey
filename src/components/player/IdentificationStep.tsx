"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSurveyPlayerStore } from "@/store/survey-player.store";
import { ParticipantForm } from "./ParticipantForm";
import { CreateParticipantDTO } from "@/domain/participant.types";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function IdentificationStep() {
  const { survey, startSession } = useSurveyPlayerStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!survey) return null;

  const handleStart = async (data: CreateParticipantDTO) => {
    setLoading(true);
    setError(null);
    try {
      await startSession(data);
      toast.success("Sessão iniciada com sucesso!");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Não foi possível iniciar a pesquisa. Tente novamente.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{survey.title}</h1>
        
        {survey.description && (
          <p className="text-lg text-muted-foreground whitespace-pre-wrap">{survey.description}</p>
        )}

        {survey.instructions && (
          <div className="bg-muted/50 p-6 rounded-xl text-sm whitespace-pre-wrap text-left border">
            <strong className="block mb-2 text-foreground">Instruções:</strong>
            <span className="text-muted-foreground leading-relaxed">{survey.instructions}</span>
          </div>
        )}
      </div>

      <div className="mt-10 bg-card border rounded-2xl shadow-sm p-6 sm:p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-2">Identificação</h2>
        <p className="text-sm text-muted-foreground">
          {survey.participantIdentificationType === "ANONYMOUS" 
            ? "Esta pesquisa é anônima. Suas respostas não serão vinculadas aos seus dados pessoais."
            : "Por favor, identifique-se para iniciar a pesquisa."}
        </p>

        {error && (
          <Alert variant="destructive" className="mt-6 text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <ParticipantForm 
          survey={survey} 
          onSubmit={handleStart} 
          loading={loading} 
        />
      </div>
    </div>
  );
}
