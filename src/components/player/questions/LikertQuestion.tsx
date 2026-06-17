import { SurveyQuestionDTO } from "@/domain/public-survey.types";

interface Props {
  question: SurveyQuestionDTO;
  value: any; // ID da scaleOption selecionada
  onChange: (value: any) => void;
}

export function LikertQuestion({ question, value, onChange }: Props) {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end min-w-[300px] gap-2">
        {question.scaleOptions.map((option) => (
          <div 
            key={option.id} 
            className="flex flex-col items-center flex-1 cursor-pointer group"
            onClick={() => onChange(option.value)}
          >
            <div className="text-xs text-muted-foreground mb-3 h-8 text-center px-1 font-medium transition-colors group-hover:text-foreground">
              {option.label || option.value}
            </div>
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${value === option.value ? 'border-primary bg-primary' : 'border-input group-hover:border-primary/50'}`}>
              {value === option.value && <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
