import { SurveyQuestionDTO } from "@/domain/public-survey.types";
import { Input } from "@/components/ui/input";

interface Props {
  question: SurveyQuestionDTO;
  value: any;
  onChange: (value: any) => void;
}

export function ShortTextQuestion({ question, value, onChange }: Props) {
  return (
    <Input
      placeholder="Digite sua resposta..."
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
  );
}
