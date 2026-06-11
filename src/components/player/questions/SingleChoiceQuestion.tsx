import { SurveyQuestionDTO } from "@/domain/public-survey.types";
import { Label } from "@/components/ui/label";

interface Props {
  question: SurveyQuestionDTO;
  value: any; // ID da opção selecionada
  onChange: (value: any) => void;
}

export function SingleChoiceQuestion({ question, value, onChange }: Props) {
  return (
    <div className="space-y-3">
      {question.options.map((option) => (
        <div key={option.id} className="flex items-center space-x-3 bg-muted/30 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onChange(option.id)}>
          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${value === option.id ? 'border-primary' : 'border-input'}`}>
            {value === option.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
          </div>
          <Label className="cursor-pointer flex-1 font-normal text-base">{option.label}</Label>
        </div>
      ))}
    </div>
  );
}
