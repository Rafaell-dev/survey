"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MEDIA_LIMITS, ALLOWED_MIME_TYPES } from "@/domain/media.types";
import { useBuilderStore } from "@/store/builder.store";

interface MediaUploaderProps {
  questionId: string;
}

export function MediaUploader({ questionId }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadMediaToQuestion } = useBuilderStore();

  const validateFile = (file: File): boolean => {
    let typeLimit = 0;
    
    if (ALLOWED_MIME_TYPES.IMAGE.includes(file.type)) {
      typeLimit = MEDIA_LIMITS.IMAGE;
    } else if (ALLOWED_MIME_TYPES.VIDEO.includes(file.type)) {
      typeLimit = MEDIA_LIMITS.VIDEO;
    } else if (ALLOWED_MIME_TYPES.AUDIO.includes(file.type)) {
      typeLimit = MEDIA_LIMITS.AUDIO;
    } else {
      toast.error("Formato de arquivo não suportado.");
      return false;
    }

    if (file.size > typeLimit) {
      toast.error(`O arquivo excede o tamanho limite permitido de ${typeLimit / 1024 / 1024}MB.`);
      return false;
    }

    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      await uploadMediaToQuestion(questionId, file, (p) => setProgress(p));
      toast.success("Upload realizado com sucesso!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro ao enviar arquivo.");
    } finally {
      setIsUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const allowedTypesStr = [
    ...ALLOWED_MIME_TYPES.IMAGE,
    ...ALLOWED_MIME_TYPES.VIDEO,
    ...ALLOWED_MIME_TYPES.AUDIO
  ].join(",");

  return (
    <div className="w-full">
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedTypesStr}
      />

      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors ${
          isUploading 
            ? "border-primary/50 bg-primary/5 cursor-not-allowed" 
            : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3 w-full max-w-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm font-medium text-primary">Enviando... {progress}%</p>
          </div>
        ) : (
          <>
            <div className="p-3 bg-muted rounded-full mb-3 text-muted-foreground">
              <UploadCloud className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold mb-1">Anexar mídia à pergunta</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              Imagens até 10MB, Áudio até 50MB, Vídeos até 200MB.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
