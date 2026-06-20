import { SurveyQuestionDTO } from "@/domain/public-survey.types";
import { Slider } from "@/components/ui/slider";

interface Props {
  question: SurveyQuestionDTO;
  value: any; // O valor numérico
  onChange: (value: any) => void;
}

export function SliderQuestion({ question, value, onChange }: Props) {
  // Pega valor mínimo e máximo pelas scaleOptions ou via propriedades diretas
  const scaleOptions = question.scaleOptions || [];
  const minOpt = scaleOptions[0];
  const maxOpt = scaleOptions[scaleOptions.length - 1];

  const min = minOpt?.value ?? question.scaleStart ?? 0;
  const max = maxOpt?.value ?? question.scaleEnd ?? 100;
  
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
