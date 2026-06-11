import { api } from './api';
import { SurveyPlayerDTO } from '../domain/public-survey.types';

export const publicSurveyService = {
  async getPublicSurvey(slug: string): Promise<SurveyPlayerDTO> {
    const response = await api.get<SurveyPlayerDTO>(`/public/surveys/${slug}`);
    return response.data;
  }
};
