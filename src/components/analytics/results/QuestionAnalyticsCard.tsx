import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionAnalyticsDTO, QuestionVisualization, ChartType } from "@/domain/analytics.types";
import { QuestionChartRenderer } from "./QuestionChartRenderer";
import { TextVisualizationRenderer } from "../text-visualizations/TextVisualizationRenderer";
import { ChartSelector } from "./selector/ChartSelector";
import { ChartSettings } from "./settings/ChartSettings";
import { useAnalyticsPreferences } from "@/contexts/AnalyticsPreferencesContext";
import { QuestionExportMenu } from "../export/QuestionExportMenu";

interface QuestionAnalyticsCardProps {
  question: QuestionAnalyticsDTO;
  index: number;
}

export function QuestionAnalyticsCard({ question, index }: QuestionAnalyticsCardProps) {
  const isTextQuestion = question.type === 'SHORT_TEXT' || question.type === 'LONG_TEXT';
  
  const { preferences, savePreference, restoreDefault, isLoaded } = useAnalyticsPreferences();
  
  const defaultChartType = isTextQuestion ? ChartType.TEXT_RESPONSE_LIST : ChartType.BAR_HORIZONTAL;
  
  const defaultVisualization: QuestionVisualization = {
    questionId: question.questionId,
    chartType: defaultChartType,
    showLegend: true,
    showTable: false,
    showValues: true,
    showPercentage: true,
    sortEnabled: true,
    sortDirection: "DESC",
    displayMode: "COUNT",
    legendPosition: "RIGHT",
  };

  const [visualization, setVisualization] = useState<QuestionVisualization>(
    preferences[question.questionId] || defaultVisualization
  );

  useEffect(() => {
    if (isLoaded) {
      if (preferences[question.questionId]) {
        setVisualization(preferences[question.questionId]);
      } else {
        setVisualization(defaultVisualization);
      }
    }
  }, [preferences, question.questionId, isLoaded]);

  const handleVisualizationChange = (newVal: QuestionVisualization) => {
    setVisualization(newVal);
    savePreference(question.questionId, newVal);
  };

  const handleRestore = () => {
    restoreDefault(question.questionId);
    setVisualization(defaultVisualization);
  };

  const cardRef = useRef<HTMLDivElement>(null);

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
    return null; 
  };

  const responsesCount = getResponsesCount();

  return (
    <Card className="border-primary/10 shadow-sm flex flex-col min-h-[450px]" ref={cardRef}>
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
          
          <div className="shrink-0 self-start sm:self-auto flex items-center gap-2">
            <ChartSettings 
              visualization={visualization}
              onVisualizationChange={handleVisualizationChange}
              onRestore={handleRestore}
            />
            <ChartSelector 
              visualization={visualization}
              onVisualizationChange={handleVisualizationChange}
              questionType={question.type}
            />
            <QuestionExportMenu question={question} cardRef={cardRef} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <div className="w-full min-h-[300px] flex items-center justify-center overflow-x-auto relative">
          {isTextQuestion ? (
            <TextVisualizationRenderer 
              question={question} 
              visualization={visualization} 
            />
          ) : (
            <QuestionChartRenderer 
              question={question} 
              visualization={visualization} 
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
