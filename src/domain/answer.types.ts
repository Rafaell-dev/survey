export interface SaveAnswerDTO {
  questionId: string;
  textValue?: string;
  numericValue?: number;
  selectedOptionId?: string;
  selectedOptionsIds?: string[];
  timeSpentMs: number;
}

export interface AnswerDTO {
  id: string;
  responseId: string;
  questionId: string;
  textValue?: string | null;
  numericValue?: number | null;
  selectedOptionId?: string | null;
  selectedOptionsIds?: string[] | null;
  timeSpentMs: number;
  createdAt: string;
  updatedAt: string;
}
