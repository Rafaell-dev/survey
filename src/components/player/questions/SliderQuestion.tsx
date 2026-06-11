import { SurveyQuestionDTO } from "@/domain/public-survey.types";
import { Slider } from "@/components/ui/slider";

interface Props {
  question: SurveyQuestionDTO;
  value: any; // O valor numérico
  onChange: (value: any) => void;
}

export function SliderQuestion({ question, value, onChange }: Props) {
  // Pega valor mínimo e máximo pelas scaleOptions (se existirem)
  const minOpt = question.scaleOptions[0];
  const maxOpt = question.scaleOptions[question.scaleOptions.length - 1];

  const min = minOpt ? minOpt.value : 0;
  const max = maxOpt ? maxOpt.value : 100;
  
  const currentValue = typeof value === 'number' ? value : min;

  return (
    <div className="space-y-6 pt-4">
      <Slider
        value={[currentValue]}
        min={min}
        max={max}
        step={1}
        onValueChange={(vals) => onChange(vals[0])}
        className="cursor-pointer"
      />
      <div className="flex justify-between text-sm text-muted-foreground font-medium">
        <span>{minOpt?.label || min}</span>
        <span className="text-foreground text-base bg-muted px-3 py-1 rounded-md">{currentValue}</span>
        <span>{maxOpt?.label || max}</span>
      </div>
    </div>
  );
}
