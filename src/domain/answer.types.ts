export interface SaveAnswerDTO {
  questionId: string;
  textValue?: string;
  numericValue?: number;
  selectedOptionId?: string;
  selectedOptionsIds?: string[];
  mediaId?: string;
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
  mediaId?: string | null;
  timeSpentMs: number;
  createdAt: string;
  updatedAt: string;
}
