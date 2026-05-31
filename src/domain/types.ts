export interface Form {
  id: string;
  title: string;
  description: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  blocks: Block[];
}

export interface Block {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export type QuestionType = 'short_answer' | 'paragraph' | 'multiple_choice' | 'checkboxes' | 'likert' | 'slider';

export interface Question {
  id: string;
  title: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  scaleStart?: number;
  scaleEnd?: number;
  scaleVisualType?: string;
  medias?: Media[];
  rules?: ConditionalRule[];
}

export interface ConditionalRule {
  id?: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN';
  matchValue: string;
  targetBlockId: string;
}

export interface Media {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  url: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
