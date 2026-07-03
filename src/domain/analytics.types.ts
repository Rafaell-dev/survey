import { QuestionType } from "./question.types";

export interface AnalyticsFilter {
  field: string;
  operator: "EQUALS" | "NOT_EQUALS" | "IN" | "GREATER_THAN" | "LESS_THAN";
  value: any;
}

export enum ChartType {
  BAR_HORIZONTAL = 'BAR_HORIZONTAL',
  BAR_VERTICAL = 'BAR_VERTICAL',
  PIE = 'PIE',
  DONUT = 'DONUT',
  LINE = 'LINE',
  AREA = 'AREA',
  RADAR = 'RADAR',
  HISTOGRAM = 'HISTOGRAM',
  BOX_PLOT = 'BOX_PLOT',
  VIOLIN = 'VIOLIN',
  NUMERIC_STATS = 'NUMERIC_STATS',
  
  // Text Visualizations
  TEXT_RESPONSE_LIST = 'TEXT_RESPONSE_LIST',
  TEXT_TABLE = 'TEXT_TABLE',
  TEXT_WORD_CLOUD = 'TEXT_WORD_CLOUD',
  TEXT_WORD_FREQUENCY = 'TEXT_WORD_FREQUENCY',
  TEXT_AI_CLUSTERS = 'TEXT_AI_CLUSTERS',
  TEXT_SENTIMENT_ANALYSIS = 'TEXT_SENTIMENT_ANALYSIS',
  TEXT_TIMELINE = 'TEXT_TIMELINE'
}

export interface QuestionVisualization {
  questionId: string;
  chartType: ChartType;
  showLegend: boolean;
  showTable: boolean;
  showValues: boolean;
  showPercentage: boolean;
  sortEnabled: boolean;
  sortDirection: "ASC" | "DESC";
  displayMode: "COUNT" | "PERCENTAGE";
  legendPosition: "RIGHT" | "BOTTOM" | "NONE";
}

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

export interface ResponseHeader {
  key: string;
  label: string;
  questionType?: string;
}

export interface ResponsesAnalyticsDTO {
  headers: ResponseHeader[];
  rows: Record<string, any>[];
}
