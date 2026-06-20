import { api } from './api';
import { 
  AnalyticsOverviewDTO, 
  QuestionsAnalyticsResponseDTO, 
  NavigationAnalyticsResponseDTO, 
  MediaAnalyticsResponseDTO 
} from '../domain/analytics.types';

export const analyticsService = {
  async getOverview(surveyId: string): Promise<AnalyticsOverviewDTO> {
    const response = await api.get(`/surveys/${surveyId}/analytics/overview`);
    return response.data;
  },

  async getQuestions(surveyId: string): Promise<QuestionsAnalyticsResponseDTO> {
    const response = await api.get(`/surveys/${surveyId}/analytics/questions`);
    return response.data;
  },

  async getNavigation(surveyId: string): Promise<NavigationAnalyticsResponseDTO> {
    const response = await api.get(`/surveys/${surveyId}/analytics/navigation`);
    return response.data;
  },

  async getMedia(surveyId: string): Promise<MediaAnalyticsResponseDTO> {
    const response = await api.get(`/surveys/${surveyId}/analytics/media`);
    return response.data;
  }
};
