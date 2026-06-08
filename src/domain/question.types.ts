export type QuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "MULTIPLE_CHOICE"
  | "SINGLE_CHOICE"
  | "LIKERT"
  | "SLIDER"
  | "MEDIA_ONLY";

export type ScaleVisualType =
  | "NUMBERS"
  | "EMOJIS"
  | "ICONS"
  | "SLIDER"
  | "TEXT_LABELS";

export interface Question {
  id: string;
  title: string;
  description?: string | null;
  type: QuestionType;
  isRequired: boolean;
  orderIndex: number;
  scaleStart?: number | null;
  scaleEnd?: number | null;
  scaleVisualType?: ScaleVisualType | null;
  blockId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionDTO {
  title: string;
  description?: string | null;
  type: QuestionType;
  isRequired?: boolean;
  scaleStart?: number | null;
  scaleEnd?: number | null;
  scaleVisualType?: ScaleVisualType | null;
}

export interface UpdateQuestionDTO {
  title?: string;
  description?: string | null;
  type?: QuestionType;
  isRequired?: boolean;
  scaleStart?: number | null;
  scaleEnd?: number | null;
  scaleVisualType?: ScaleVisualType | null;
}

export interface ReorderQuestionsDTO {
  questions: {
    id: string;
    orderIndex: number;
  }[];
}

export interface LocalQuestion extends Partial<Question> {
  id: string;
  title: string;
  type: QuestionType;
  blockId: string;
  orderIndex: number;
  isNew?: boolean;
}
