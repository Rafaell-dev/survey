import { SurveyQuestionDTO } from "@/domain/public-survey.types";
import { ShortTextQuestion } from "./questions/ShortTextQuestion";
import { LongTextQuestion } from "./questions/LongTextQuestion";
import { SingleChoiceQuestion } from "./questions/SingleChoiceQuestion";
import { MultipleChoiceQuestion } from "./questions/MultipleChoiceQuestion";
import { LikertQuestion } from "./questions/LikertQuestion";
import { SliderQuestion } from "./questions/SliderQuestion";
import { MediaRenderer } from "./MediaRenderer";

interface Props {
  question: SurveyQuestionDTO;
  value: any;
  onChange: (value: any) => void;
}

export function QuestionRenderer({ question, value, onChange }: Props) {
  const renderQuestionInput = () => {
    // Fallback: se a questão é do tipo Likert mas a visualização escolhida foi Slider
    if (question.type === "LIKERT" && question.scaleVisualType === "SLIDER") {
      return <SliderQuestion question={question} value={value} onChange={onChange} />;
    }

    switch (question.type) {
      case "SHORT_TEXT":
        return <ShortTextQuestion question={question} value={value} onChange={onChange} />;
      case "LONG_TEXT":
        return <LongTextQuestion question={question} value={value} onChange={onChange} />;
      case "SINGLE_CHOICE":
        return <SingleChoiceQuestion question={question} value={value} onChange={onChange} />;
      case "MULTIPLE_CHOICE":
        return <MultipleChoiceQuestion question={question} value={value} onChange={onChange} />;
      case "LIKERT":
        return <LikertQuestion question={question} value={value} onChange={onChange} />;
      case "SLIDER":
        return <SliderQuestion question={question} value={value} onChange={onChange} />;
      case "MEDIA_ONLY":
        return null; // Apenas renderiza a mídia principal
      default:
        return <div className="text-destructive text-sm">Tipo de questão não suportado</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Mídias da questão */}
      {question.medias?.length > 0 && (
        <div className="space-y-4">
          {question.medias.map(media => (
            <MediaRenderer key={media.id} media={media} />
          ))}
        </div>
      )}

      {/* Título e Descrição */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold leading-relaxed">
          {question.title}
          {question.isRequired && <span className="text-destructive ml-1">*</span>}
        </h3>
        {question.description && (
          <p className="text-muted-foreground whitespace-pre-wrap">{question.description}</p>
        )}
      </div>

      {/* Input */}
      {renderQuestionInput()}
    </div>
  );
}
