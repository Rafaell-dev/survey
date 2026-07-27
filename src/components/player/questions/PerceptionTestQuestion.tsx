"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SurveyQuestionDTO } from "@/domain/public-survey.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  question: SurveyQuestionDTO;
  value: any; // String JSON
  onChange: (value: any) => void;
}

interface Interaction {
  id: string;
  timeOffsetMs: number;
  answer: string;
}

export function PerceptionTestQuestion({ question, value, onChange }: Props) {
  const media = question.medias?.[0];
  const interactionQuestionLabel = question.options?.[0]?.label || "O que você percebeu?";
  
  const [interactions, setInteractions] = useState<Interaction[]>(() => {
    if (typeof value === "string" && value) {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isPausedForInput, setIsPausedForInput] = useState(false);
  const [currentPauseTime, setCurrentPauseTime] = useState<number | null>(null);
  const [currentInput, setCurrentInput] = useState("");
  
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync value with interactions
  useEffect(() => {
    const newValue = JSON.stringify(interactions);
    if (value !== newValue) {
      onChange(newValue);
    }
  }, [interactions, value, onChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isPausedForInput) return; // Se já estiver pausado para responder, ignora
    
    // Evita capturar espaço se o usuário estiver focado em algum botão nativo ou input
    if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (e.code === "Space" || e.key.length === 1) {
      e.preventDefault();
      
      if (mediaRef.current) {
        mediaRef.current.pause();
        setCurrentPauseTime(mediaRef.current.currentTime * 1000);
        setIsPausedForInput(true);
      }
    }
  }, [isPausedForInput]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isPausedForInput && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50); // timeout para garantir render
    }
  }, [isPausedForInput]);

  const handleSaveInteraction = () => {
    if (currentPauseTime !== null) {
      setInteractions(prev => [
        ...prev, 
        { id: crypto.randomUUID(), timeOffsetMs: Math.round(currentPauseTime), answer: currentInput }
      ]);
    }
    
    setIsPausedForInput(false);
    setCurrentInput("");
    setCurrentPauseTime(null);
    
    if (mediaRef.current) {
      mediaRef.current.play().catch(console.error);
    }
  };

  const handleSkip = () => {
    setIsPausedForInput(false);
    setCurrentInput("");
    setCurrentPauseTime(null);
    if (mediaRef.current) {
      mediaRef.current.play().catch(console.error);
    }
  };

  if (!media) {
    return <div className="p-4 text-center text-muted-foreground border rounded-md bg-muted/20">Nenhuma mídia foi configurada para este teste de percepção.</div>;
  }

  const isAudio = media.type === "AUDIO";

  return (
    <div className="space-y-6 flex flex-col items-center max-w-3xl mx-auto w-full pt-4">
      <div className="w-full bg-black/5 rounded-xl overflow-hidden relative flex flex-col items-center justify-center p-4 border">
        {isAudio ? (
          <audio ref={mediaRef as any} src={media.url} controls className="w-full max-w-md" />
        ) : (
          <video ref={mediaRef as any} src={media.url} controls className="w-full max-h-[60vh] object-contain rounded-md" />
        )}
      </div>

      <div className="bg-muted/30 p-4 rounded-lg border w-full text-center">
        <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
          Instruções do Teste
        </p>
        <p className="text-base text-foreground">
          Dê o <strong>Play</strong> na mídia acima. Quando perceber o evento solicitado, pressione a <strong>Barra de Espaço</strong> ou qualquer tecla para registrar o momento.
        </p>
      </div>

      {isPausedForInput && (
        <div className="w-full bg-primary/5 border border-primary/20 p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4 shadow-sm">
          <h4 className="font-semibold text-lg mb-4 text-foreground text-center">
            {interactionQuestionLabel}
          </h4>
          <div className="flex items-center gap-3">
            <Input 
              ref={inputRef}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Digite sua resposta..."
              className="flex-1 bg-background h-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && currentInput.trim()) handleSaveInteraction();
                if (e.key === 'Escape') handleSkip();
              }}
            />
            <Button onClick={handleSaveInteraction} disabled={!currentInput.trim()} className="h-10">Continuar</Button>
            <Button onClick={handleSkip} variant="ghost" className="h-10">Ignorar</Button>
          </div>
        </div>
      )}

      {interactions.length > 0 && (
        <div className="w-full pt-4 border-t">
          <h5 className="text-sm font-semibold text-muted-foreground mb-3">Registros de Percepção ({interactions.length})</h5>
          <div className="space-y-2">
            {interactions.map(int => (
              <div key={int.id} className="flex justify-between items-center text-sm bg-muted/20 p-2 px-3 rounded border">
                <span className="font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded text-xs border">
                  {(int.timeOffsetMs / 1000).toFixed(1)}s
                </span>
                <span className="font-medium text-right flex-1 ml-4 truncate">{int.answer}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
