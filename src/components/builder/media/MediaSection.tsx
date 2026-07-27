"use client";

import { useState } from "react";
import { MediaUploader } from "./MediaUploader";
import { MediaList } from "./MediaList";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { useBuilderStore } from "@/store/builder.store";

interface MediaSectionProps {
  questionId: string;
  isNew?: boolean;
  maxMediaCount?: number;
}

export function MediaSection({ questionId, isNew, maxMediaCount }: MediaSectionProps) {
  const [showUploader, setShowUploader] = useState(false);
  const medias = useBuilderStore(state => state.mediaByQuestion[questionId]) || [];
  const isAtLimit = maxMediaCount !== undefined && medias.length >= maxMediaCount;

  return (
    <div className="mt-4 pt-4 border-t border-dashed space-y-4">
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
            className="w-full border-dashed text-muted-foreground hover:text-foreground" 
            onClick={() => setShowUploader(true)}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Adicionar Mídia
          </Button>
        )
      )}
      
      {isAtLimit && medias.length > 0 && (
        <p className="text-xs text-muted-foreground text-center italic mt-2">
          O limite de mídias para esta questão foi atingido.
        </p>
      )}
    </div>
  );
}
