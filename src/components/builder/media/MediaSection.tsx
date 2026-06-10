"use client";

import { useState } from "react";
import { MediaUploader } from "./MediaUploader";
import { MediaList } from "./MediaList";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

interface MediaSectionProps {
  questionId: string;
  isNew?: boolean;
}

export function MediaSection({ questionId, isNew }: MediaSectionProps) {
  const [showUploader, setShowUploader] = useState(false);

  return (
    <div className="mt-4 pt-4 border-t border-dashed space-y-4">
      <MediaList questionId={questionId} isNew={isNew} />
      
      {!isNew && (
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
    </div>
  );
}
