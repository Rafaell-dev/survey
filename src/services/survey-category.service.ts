import { api } from './api';

export interface SurveyCategory {
  id: string;
  name: string;
  _count?: {
    surveys: number;
  };
}

export const surveyCategoryService = {
  async list(): Promise<SurveyCategory[]> {
    const res = await api.get('/survey-categories');
    return res.data;
  },

  async create(name: string): Promise<SurveyCategory> {
    const res = await api.post('/survey-categories', { name });
    return res.data;
  },

  async update(id: string, name: string): Promise<SurveyCategory> {
    const res = await api.put(`/survey-categories/${id}`, { name });
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/survey-categories/${id}`);
  }
};
