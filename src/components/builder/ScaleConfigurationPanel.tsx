"use client";

import { LocalQuestion, ScaleVisualType } from "@/domain/question.types";
import { Input } from "@/components/ui/input";
import { ScalePreview } from "./ScalePreview";

interface ScaleConfigurationPanelProps {
  question: LocalQuestion;
  onUpdate: (id: string, updates: Partial<LocalQuestion>) => void;
}

const VISUAL_TYPES: Record<ScaleVisualType, string> = {
  NUMBERS: "Números",
  EMOJIS: "Emojis",
  ICONS: "Ícones (Estrelas)",
  SLIDER: "Barra Deslizante (Slider)",
  TEXT_LABELS: "Rótulos de Texto"
};

export function ScaleConfigurationPanel({ question, onUpdate }: ScaleConfigurationPanelProps) {
  const start = question.scaleStart ?? 1;
  const end = question.scaleEnd ?? 5;
  const visualType = question.scaleVisualType ?? "NUMBERS";

  // Limitar opções da escala para no mínimo 2 e máximo 6 (conforme regra de negócio)
  const handleStartChange = (val: number) => {
    let steps = end - val + 1;
    if (steps < 2) val = end - 1;
    if (steps > 6) val = end - 5;
    if (val >= end) val = end - 1;
    
    onUpdate(question.id, { scaleStart: val });
  };

  const handleEndChange = (val: number) => {
    let steps = val - start + 1;
    if (steps < 2) val = start + 1;
    if (steps > 6) val = start + 5;
    if (val <= start) val = start + 1;

    onUpdate(question.id, { scaleEnd: val });
  };

  return (
    <div className="mt-4 pt-4 border-t border-dashed space-y-6">
      
      {/* Configurações Numéricas e Visuais */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Início da Escala
          </label>
          <Input 
            type="number" 
            value={start}
            onChange={(e) => handleStartChange(Number(e.target.value))}
            className="h-8 shadow-none focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Fim da Escala
          </label>
          <Input 
            type="number" 
            value={end}
            onChange={(e) => handleEndChange(Number(e.target.value))}
            className="h-8 shadow-none focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Exibição Visual
          </label>
          <select
            value={visualType}
            onChange={(e) => onUpdate(question.id, { scaleVisualType: e.target.value as ScaleVisualType })}
            className="w-full h-8 text-sm bg-background border rounded-md px-2 focus:ring-1 focus:ring-primary outline-none"
          >
            {Object.entries(VISUAL_TYPES).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview em Tempo Real */}
      <div className="bg-muted/10 p-4 rounded-lg border">
        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Visualização (Preview)
        </h5>
        <div className="flex justify-center w-full">
          <ScalePreview start={start} end={end} visualType={visualType} />
        </div>
      </div>

    </div>
  );
}
