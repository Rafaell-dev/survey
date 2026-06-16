import { api } from './api';
import { SurveyPlayerDTO } from '../domain/public-survey.types';
import { CreateParticipantDTO, ResponseSessionDTO } from '../domain/participant.types';

export const publicSurveyService = {
  async getPublicSurvey(slug: string): Promise<SurveyPlayerDTO> {
    const response = await api.get<SurveyPlayerDTO>(`/public/surveys/${slug}`);
    return response.data;
  },

  async startResponse(surveyId: string, participantData: CreateParticipantDTO): Promise<ResponseSessionDTO> {
    const response = await api.post<ResponseSessionDTO>(`/public/surveys/${surveyId}/start`, participantData);
    return response.data;
  }
};
