import { QuestionAnalyticsDTO, QuestionVisualization } from "@/domain/analytics.types";

export interface QuestionChartProps {
  question: QuestionAnalyticsDTO;
  visualization: QuestionVisualization;
}
