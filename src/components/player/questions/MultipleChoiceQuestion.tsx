import { SurveyQuestionDTO } from "@/domain/public-survey.types";
import { Label } from "@/components/ui/label";

interface Props {
  question: SurveyQuestionDTO;
  value: string[]; // Array com IDs selecionados
  onChange: (value: any) => void;
}

export function MultipleChoiceQuestion({ question, value, onChange }: Props) {
  const selectedValues = Array.isArray(value) ? value : [];

  const handleToggle = (optionId: string) => {
    if (selectedValues.includes(optionId)) {
      onChange(selectedValues.filter(id => id !== optionId));
    } else {
      onChange([...selectedValues, optionId]);
    }
  };

  return (
    <div className="space-y-3">
      {question.options.map((option) => {
        const isSelected = selectedValues.includes(option.id);
        
        return (
          <div 
            key={option.id} 
            className="flex items-center space-x-3 bg-muted/30 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" 
            onClick={() => handleToggle(option.id)}
          >
            <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}>
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <Label className="cursor-pointer flex-1 font-normal text-base">{option.label}</Label>
          </div>
        );
      })}
    </div>
  );
}
