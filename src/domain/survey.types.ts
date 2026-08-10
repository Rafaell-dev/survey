export type SurveyStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ParticipantIdentificationType = "ANONYMOUS" | "EMAIL" | "PHONE" | "EMAIL_OR_PHONE" | "NAME_AND_EMAIL";

export interface PublicLinkInfo {
  surveyId: string;
  publicSlug: string | null;
  publicLinkActive: boolean;
  url: string | null;
}

export interface SurveyCategory {
  id: string;
  name: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  status: SurveyStatus;
  participantIdentificationType: ParticipantIdentificationType;
  allowMultipleResponses: boolean;
  publicSlug: string | null;
  publicLinkActive: boolean;
  isHighlighted?: boolean;
  categoryId?: string | null;
  category?: SurveyCategory | null;
  researcherId: string;
  createdAt: string;
  updatedAt: string;
  
  // Relações que a API devolve ao consultar ID
  blocks?: any[]; // Trataremos os blocos num módulo futuro
}

export interface CreateSurveyDTO {
  title: string;
  description?: string;
  instructions?: string;
}

export interface UpdateSurveyDTO {
  title?: string;
  description?: string;
  instructions?: string;
  isHighlighted?: boolean;
  categoryId?: string | null;
}

export interface UpdateSurveySettingsDTO {
  participantIdentificationType?: ParticipantIdentificationType;
  allowMultipleResponses?: boolean;
}

export interface SurveyPaginationResponse {
  items: Survey[];
  total: number;
  page: number;
  limit: number;
}
