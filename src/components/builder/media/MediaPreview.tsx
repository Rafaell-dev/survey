"use client";

import { Media } from "@/domain/media.types";

interface MediaPreviewProps {
  media: Media;
}

export function MediaPreview({ media }: MediaPreviewProps) {
  if (media.type === "IMAGE") {
    return (
      <div className="relative w-full rounded-md overflow-hidden bg-muted/20 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={media.url} 
          alt={media.fileName || "Imagem da pergunta"} 
          className="max-w-full max-h-[300px] object-contain"
        />
      </div>
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div className="w-full rounded-md overflow-hidden bg-black flex items-center justify-center">
        <video 
          controls 
          src={media.url} 
          className="max-w-full max-h-[400px]"
          controlsList="nodownload"
        />
      </div>
    );
  }

  if (media.type === "AUDIO") {
    return (
      <div className="w-full p-4 rounded-md bg-muted/20 flex flex-col gap-2">
        <span className="text-sm font-medium text-muted-foreground truncate">
          {media.fileName || "Áudio anexado"}
        </span>
        <audio 
          controls 
          src={media.url} 
          className="w-full h-10"
          controlsList="nodownload"
        />
      </div>
    );
  }

  return null;
}
