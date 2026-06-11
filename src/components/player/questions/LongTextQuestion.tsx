import { SurveyQuestionDTO } from "@/domain/public-survey.types";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  question: SurveyQuestionDTO;
  value: any;
  onChange: (value: any) => void;
}

export function LongTextQuestion({ question, value, onChange }: Props) {
  return (
    <Textarea
      placeholder="Digite sua resposta detalhada..."
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full min-h-[120px]"
    />
  );
}
