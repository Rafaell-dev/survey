import { SurveyQuestionDTO } from "@/domain/public-survey.types";
import { Star } from "lucide-react";

interface Props {
  question: SurveyQuestionDTO;
  value: any; // ID ou valor numérico
  onChange: (value: any) => void;
}

export function LikertQuestion({ question, value, onChange }: Props) {
  // Configurações
  const visualType = question.scaleVisualType || "NUMBERS";
  const start = question.scaleStart ?? 1;
  const end = question.scaleEnd ?? 5;
  const steps = Math.max(1, end - start + 1);

  // Fallback
  const options = question.scaleOptions && question.scaleOptions.length > 0 
    ? question.scaleOptions 
    : Array.from({ length: steps }, (_, i) => {
        const val = start + i;
        return {
          id: `auto-${val}`,
          value: val,
          label: null, // Deixe null para permitir o fallback do TEXT_LABELS
          orderIndex: i
        };
      });

  const getEmojiForIndex = (index: number, total: number) => {
    const ratio = total > 1 ? index / (total - 1) : 0.5;
    if (ratio < 0.2) return "😡";
    if (ratio < 0.4) return "😕";
    if (ratio <= 0.6) return "😐";
    if (ratio < 0.8) return "🙂";
    return "😍";
  };

  const getTextLabelForIndex = (index: number, total: number) => {
    if (total === 2) return index === 0 ? "Discordo" : "Concordo";
    if (total === 3) return index === 0 ? "Discordo" : index === 1 ? "Neutro" : "Concordo";
    if (total === 4) return ["Discordo Totalmente", "Discordo", "Concordo", "Concordo Totalmente"][index];
    if (total === 5) return ["Discordo Totalmente", "Discordo", "Neutro", "Concordo", "Concordo Totalmente"][index];
    if (total === 6) return ["Discordo Fortemente", "Discordo", "Neutro/Discordo", "Neutro/Concordo", "Concordo", "Concordo Fortemente"][index];
    return `Opção ${index + 1}`;
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end min-w-[300px] gap-2">
        {options.map((option, index) => {
          
          let content;
          if (visualType === "EMOJIS") {
            content = (
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all cursor-pointer">
                  {getEmojiForIndex(index, options.length)}
                </span>
                <span className="text-[10px] text-muted-foreground">{option.label || option.value}</span>
              </div>
            );
          } else if (visualType === "ICONS") {
            content = (
              <div className="flex flex-col items-center gap-1">
                <Star className={`w-8 h-8 transition-colors ${value === option.value ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30 fill-muted-foreground/10 group-hover:text-yellow-400/50 group-hover:fill-yellow-400/50'}`} />
                <span className="text-[10px] text-muted-foreground">{option.label || option.value}</span>
              </div>
            );
          } else if (visualType === "TEXT_LABELS") {
            const labelStr = option.label || getTextLabelForIndex(index, options.length);
            content = (
              <div className="text-[10px] sm:text-xs text-muted-foreground mb-3 h-10 flex items-center justify-center text-center px-1 font-medium transition-colors group-hover:text-foreground max-w-[80px] leading-tight">
                {labelStr}
              </div>
            );
          } else {
            // NUMBERS e fallback
            content = (
              <div className="text-xs text-muted-foreground mb-3 h-8 text-center px-1 font-medium transition-colors group-hover:text-foreground">
                {option.label || option.value}
              </div>
            );
          }

          const isVisualType = visualType === "EMOJIS" || visualType === "ICONS";

          return (
            <div 
              key={option.id} 
              className="flex flex-col items-center flex-1 cursor-pointer group"
              onClick={() => onChange(option.value)}
            >
              {content}
              
              {/* Bolinha de seleção apenas para números ou textos */}
              {!isVisualType && (
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${value === option.value ? 'border-primary bg-primary' : 'border-input group-hover:border-primary/50'}`}>
                  {value === option.value && <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full" />}
                </div>
              )}

              {/* Traço de seleção para Emojis e Ícones */}
              {isVisualType && (
                <div className={`h-1 w-8 rounded-full mt-2 transition-colors ${value === option.value ? 'bg-primary' : 'bg-transparent'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
