"use client";

import { useState } from "react";
import { MediaUploader } from "./MediaUploader";
import { MediaList } from "./MediaList";
import { Button } from "@/components/ui/button";
import { ImagePlus, Info, CheckCircle2 } from "lucide-react";
import { useBuilderStore } from "@/store/builder.store";

interface MediaSectionProps {
  questionId: string;
  isNew?: boolean;
  maxMediaCount?: number;
}

export function MediaSection({ questionId, isNew, maxMediaCount = 4 }: MediaSectionProps) {
  const [showUploader, setShowUploader] = useState(false);
  const medias = useBuilderStore(state => state.mediaByQuestion[questionId]) || [];
  const isAtLimit = medias.length >= maxMediaCount;

  return (
    <div className="mt-4 pt-4 border-t border-dashed space-y-4">
      {/* Informação sobre rotação condicional */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground flex items-start gap-2.5">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-medium text-foreground">
            Mídias com limite de respostas por mídia (até {maxMediaCount} mídias)
          </p>
          <p>
            Configure um limite condicional de <strong>1 até 9999</strong> respostas para cada mídia. Quando o limite for atingido, os novos respondentes verão automaticamente a próxima mídia configurada na sequência.
          </p>
        </div>
      </div>

      <MediaList questionId={questionId} isNew={isNew} />
      
      {!isNew && !isAtLimit && (
        showUploader ? (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <MediaUploader 
              questionId={questionId} 
              onComplete={() => setShowUploader(false)} 
            />
            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground" 
              onClick={() => setShowUploader(false)}
            >
              Cancelar Upload
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="w-full border-dashed text-muted-foreground hover:text-foreground hover:border-primary/50" 
            onClick={() => setShowUploader(true)}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Adicionar Mídia ({medias.length}/{maxMediaCount})
          </Button>
        )
      )}
      
      {isAtLimit && medias.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-muted/30 border text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
          <span>Limite máximo de {maxMediaCount} mídias configuradas para esta questão foi atingido.</span>
        </div>
      )}
    </div>
  );
}
