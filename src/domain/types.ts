export interface Form {
  id: string;
  title: string;
  description: string;
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
}

export interface User {
  id: string;
  name: string;
  email: string;
}
