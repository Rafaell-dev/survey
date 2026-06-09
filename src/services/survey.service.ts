import { api } from './api';
import { 
  Survey, 
  CreateSurveyDTO, 
  UpdateSurveyDTO, 
  SurveyPaginationResponse 
} from '../domain/survey.types';

export const surveyService = {
  async getSurveys(page = 1, limit = 20, search = ''): Promise<SurveyPaginationResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);

    const response = await api.get<SurveyPaginationResponse>(`/surveys?${params.toString()}`);
    return response.data;
  },

  async getSurveyById(id: string): Promise<Survey> {
    const response = await api.get<Survey>(`/surveys/${id}`);
    return response.data;
  },

  async createSurvey(data: CreateSurveyDTO): Promise<Survey> {
    const response = await api.post<Survey>('/surveys', data);
    return response.data;
  },

  async updateSurvey(id: string, data: UpdateSurveyDTO): Promise<Survey> {
    const response = await api.patch<Survey>(`/surveys/${id}`, data);
    return response.data;
  },

  async deleteSurvey(id: string): Promise<void> {
    await api.delete(`/surveys/${id}`);
  },

  async syncSurveyTree(id: string, payload: any): Promise<any> {
    const response = await api.put(`/surveys/${id}/sync`, payload);
    return response.data;
  }
};
