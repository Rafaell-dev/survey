export interface QuestionOption {
  id: string;
  label: string;
  value?: number | null;
  orderIndex: number;
  questionId: string;
}

export interface CreateQuestionOptionDTO {
  label: string;
  value?: number;
}

export interface UpdateQuestionOptionDTO {
  label?: string;
  value?: number;
}

export interface ReorderQuestionOptionsDTO {
  options: {
    id: string;
    orderIndex: number;
  }[];
}

export interface LocalOption extends Partial<QuestionOption> {
  id: string;
  label: string;
  orderIndex: number;
  questionId: string;
  isNew?: boolean;
}
