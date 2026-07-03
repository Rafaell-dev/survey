import { Card } from "@/components/ui/card";
import { QuestionsAnalyticsResponseDTO } from "@/domain/analytics.types";
import { QuestionAnalyticsCard } from "./QuestionAnalyticsCard";

interface SurveyResultsPageProps {
  questionsData: QuestionsAnalyticsResponseDTO | null;
}

export function SurveyResultsPage({ questionsData }: SurveyResultsPageProps) {
  if (!questionsData || questionsData.questions.length === 0) {
    return (
      <Card className="p-12 text-center text-muted-foreground border-dashed">
        Não há dados de respostas estruturadas para exibir.
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {questionsData.questions.map((q, i) => (
        <QuestionAnalyticsCard key={q.questionId} question={q} index={i} />
      ))}
    </div>
  );
}
