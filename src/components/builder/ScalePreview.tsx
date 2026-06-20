"use client";

import { ScaleVisualType } from "@/domain/question.types";
import { Star } from "lucide-react";

interface ScalePreviewProps {
  start: number;
  end: number;
  visualType: ScaleVisualType;
}

export function ScalePreview({ start, end, visualType }: ScalePreviewProps) {
  const steps = Math.max(1, end - start + 1);
  const elements = Array.from({ length: steps }, (_, i) => start + i);

  // Mapeamento dinâmico de emojis baseado no tamanho (exemplo p/ 5: 😡 😕 😐 🙂 😍)
  const getEmojiForIndex = (index: number, total: number) => {
    const ratio = total > 1 ? index / (total - 1) : 0.5;
    if (ratio < 0.2) return "😡";
    if (ratio < 0.4) return "😕";
    if (ratio <= 0.6) return "😐";
    if (ratio < 0.8) return "🙂";
    return "😍";
  };

  if (visualType === "NUMBERS") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {elements.map((num) => (
          <div key={num} className="w-10 h-10 rounded-full border flex items-center justify-center text-sm font-medium bg-muted/20 text-muted-foreground">
            {num}
          </div>
        ))}
      </div>
    );
  }

  if (visualType === "EMOJIS") {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        {elements.map((num, i) => (
          <div key={num} className="flex flex-col items-center gap-1">
            <span className="text-3xl grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
              {getEmojiForIndex(i, steps)}
            </span>
            <span className="text-[10px] text-muted-foreground">{num}</span>
          </div>
        ))}
      </div>
    );
  }

  if (visualType === "ICONS") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {elements.map((num) => (
          <div key={num} className="flex flex-col items-center gap-1">
            <Star className="w-8 h-8 text-muted-foreground/30 fill-muted-foreground/10" />
            <span className="text-[10px] text-muted-foreground">{num}</span>
          </div>
        ))}
      </div>
    );
  }

  if (visualType === "SLIDER") {
    return (
      <div className="w-full max-w-md pt-2 pb-4">
        <input 
          type="range" 
          min={start} 
          max={end} 
          defaultValue={start + Math.floor(steps/2)}
          className="w-full accent-primary" 
          disabled
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{start}</span>
          <span>{end}</span>
        </div>
      </div>
    );
  }

  if (visualType === "TEXT_LABELS") {
    const getTextLabelForIndex = (index: number, total: number) => {
      if (total === 2) return index === 0 ? "Discordo" : "Concordo";
      if (total === 3) return index === 0 ? "Discordo" : index === 1 ? "Neutro" : "Concordo";
      if (total === 4) return ["Discordo Totalmente", "Discordo", "Concordo", "Concordo Totalmente"][index];
      if (total === 5) return ["Discordo Totalmente", "Discordo", "Neutro", "Concordo", "Concordo Totalmente"][index];
      if (total === 6) return ["Discordo Fortemente", "Discordo", "Neutro/Discordo", "Neutro/Concordo", "Concordo", "Concordo Fortemente"][index];
      return `Opção ${index + 1}`;
    };

    return (
      <div className="flex items-start justify-between w-full bg-muted/30 p-4 rounded-lg border overflow-x-auto">
        {elements.map((num, i) => (
          <div key={num} className="flex items-center flex-1 last:flex-none min-w-[60px]">
            <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs text-center flex-1">
              <div className="w-4 h-4 rounded-full border border-current opacity-50 shrink-0" />
              <span className="leading-tight px-1 max-w-[80px]">{getTextLabelForIndex(i, steps)}</span>
            </div>
            {i < elements.length - 1 && (
              <div className="flex-1 h-[1px] bg-border mx-1 sm:mx-2 min-w-[8px]" />
            )}
          </div>
        ))}
      </div>
    );
  }

  return null;
}
