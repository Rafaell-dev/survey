import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartType, QuestionAnalyticsDTO, QuestionVisualization } from "@/domain/analytics.types";
import { QuestionChartRenderer } from "./QuestionChartRenderer";
import { ChartSelector } from "./selector/ChartSelector";
import { ChartSettings } from "./settings/ChartSettings";
import { useState } from "react";

interface QuestionAnalyticsCardProps {
  question: QuestionAnalyticsDTO;
  index: number;
}

export function QuestionAnalyticsCard({ question, index }: QuestionAnalyticsCardProps) {
  const getQuestionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'SHORT_TEXT': 'Texto Curto',
      'LONG_TEXT': 'Texto Longo',
      'SINGLE_CHOICE': 'Múltipla Escolha (Única)',
      'MULTIPLE_CHOICE': 'Múltipla Escolha (Múltipla)',
      'LIKERT': 'Escala Likert',
      'SLIDER': 'Slider Numérico',
      'MEDIA_ONLY': 'Apenas Mídia'
    };
    return types[type] || type;
  };

  const getResponsesCount = () => {
    if (Array.isArray(question.responses)) return question.responses.length;
    if (typeof question.responses === 'number') return question.responses;
    return null; // Não temos a contagem exata para as de múltipla escolha ainda
  };

  const responsesCount = getResponsesCount();

  const [visualization, setVisualization] = useState<QuestionVisualization>({
    questionId: question.questionId,
    chartType: ChartType.BAR_HORIZONTAL,
    showLegend: true,
    showTable: false,
    showValues: true,
    showPercentage: true,
    sortEnabled: true,
    sortDirection: "DESC",
    displayMode: "COUNT",
    legendPosition: "RIGHT",
  });

  return (
    <Card className="border-primary/10 shadow-sm flex flex-col">
      <CardHeader className="pb-3 border-b mb-4">
        <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{index + 1}.</span> 
              <span>{question.questionTitle || `Questão ${question.questionId.substring(0, 8)}...`}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {question.blockTitle && (
                <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">
                  {question.blockTitle}
                </span>
              )}
              <span className="text-xs font-normal px-2 py-1 bg-secondary rounded-full">
                {getQuestionTypeLabel(question.type)}
              </span>
              {responsesCount !== null && (
                <span className="text-xs font-medium px-2 py-1 bg-muted rounded-full">
                  {responsesCount} resposta{responsesCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          
          <div className="shrink-0 self-end sm:self-auto mt-2 sm:mt-0 flex items-center gap-2">
            <ChartSelector 
              visualization={visualization}
              onVisualizationChange={setVisualization}
            />
            <ChartSettings 
              visualization={visualization}
              onVisualizationChange={setVisualization}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <QuestionChartRenderer 
          question={question} 
          visualization={visualization} 
        />
      </CardContent>
    </Card>
  );
}
