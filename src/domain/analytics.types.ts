import { QuestionType } from "./question.types";

export interface AnalyticsOverviewDTO {
  surveyId: string;
  participants: number;
  responsesStarted: number;
  responsesCompleted: number;
  completionRate: number;
  abandonmentRate: number;
  averageTimeMs: number;
}

export interface QuestionOptionAnalytics {
  optionId: string;
  label: string;
  count: number;
  percentage: number;
}

export interface QuestionAnalyticsDTO {
  questionId: string;
  type: QuestionType;
  questionTitle?: string;
  blockTitle?: string;
  options?: QuestionOptionAnalytics[];
  average?: number;
  minimum?: number;
  maximum?: number;
  responses?: any[]; // pode ser textos curtos, textos longos ou número de respostas
}

export interface QuestionsAnalyticsResponseDTO {
  questions: QuestionAnalyticsDTO[];
}

export interface BlockNavigationAnalytics {
  blockId: string;
  title: string | null;
  averageTimeMs: number;
  visits: number;
}

export interface NavigationAnalyticsResponseDTO {
  blocks: BlockNavigationAnalytics[];
}

export interface MediaAnalyticsItem {
  mediaId: string;
  fileName?: string | null;
  plays: number;
  pauses: number;
  ends: number;
  clicks: number;
}

export interface MediaAnalyticsResponseDTO {
  medias: MediaAnalyticsItem[];
}
