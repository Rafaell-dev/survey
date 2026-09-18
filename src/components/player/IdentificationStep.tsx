"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSurveyPlayerStore } from "@/store/survey-player.store";
import { ParticipantForm } from "./ParticipantForm";
import { CreateParticipantDTO } from "@/domain/participant.types";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function IdentificationStep() {
  const { survey, startSession, isPreviewMode } = useSurveyPlayerStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<CreateParticipantDTO | null>(null);

  if (!survey) return null;

  const handleStart = async (data: CreateParticipantDTO) => {
    setPendingData(data);
  };

  const confirmStart = async () => {
    if (!pendingData) return;
    setLoading(true);
    setError(null);
    try {
      await startSession(pendingData);
      toast.success("Sessão iniciada com sucesso!");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Não foi possível iniciar a pesquisa. Tente novamente.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setPendingData(null);
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
          isPreviewMode={isPreviewMode}
        />
      </div>

      {pendingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in text-left">
          <div className="bg-background w-full max-w-md rounded-xl p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-2">Atenção</h3>
            <p className="text-muted-foreground mb-6">
              Ao iniciar, não saia desta página ou mude de aba. Se você trocar de aba durante a resposta, a pesquisa será invalidada e reiniciada imediatamente.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPendingData(null)}>Cancelar</Button>
              <Button variant="default" onClick={confirmStart} className="gap-2">
                Entendi e quero começar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
