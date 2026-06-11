import { SurveyStatus, ParticipantIdentificationType } from './survey.types';
import { QuestionType } from './question.types';
import { MediaType } from './media.types';
import { RuleOperator } from './conditional-rule.types';

export interface SurveyOptionDTO {
  id: string;
  label: string;
  orderIndex: number;
}

export interface SurveyScaleOptionDTO {
  id: string;
  value: number;
  label: string | null;
  orderIndex: number;
}

export interface SurveyMediaDTO {
  id: string;
  type: "IMAGE" | "VIDEO" | "AUDIO";
  url: string;
}

export interface ConditionalRuleDTO {
  id: string;
  operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "LESS_THAN";
  matchValue: string;
  targetBlockId: string;
}

export interface SurveyQuestionDTO {
  id: string;
  type: "SHORT_TEXT" | "LONG_TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "LIKERT" | "SLIDER" | "MEDIA_ONLY";
  title: string;
  description: string | null;
  isRequired: boolean;
  orderIndex: number;
  options: SurveyOptionDTO[];
  scaleOptions: SurveyScaleOptionDTO[];
  medias: SurveyMediaDTO[];
  rules: ConditionalRuleDTO[];
}

export interface SurveyBlockDTO {
  id: string;
  title: string | null;
  description: string | null;
  orderIndex: number;
  questions: SurveyQuestionDTO[];
}

export interface SurveyPlayerDTO {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  participantIdentificationType: "ANONYMOUS" | "EMAIL" | "PHONE" | "EMAIL_OR_PHONE" | "NAME_AND_EMAIL";
  allowMultipleResponses: boolean;
  publicSlug: string | null;
  publicLinkActive: boolean;
  blocks: SurveyBlockDTO[];
}
