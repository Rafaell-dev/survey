import { api } from './api';
import { 
  QuestionOption, 
  CreateQuestionOptionDTO, 
  UpdateQuestionOptionDTO, 
  ReorderQuestionOptionsDTO 
} from '../domain/question-option.types';

export const questionOptionService = {
  async getOptionsByQuestion(questionId: string): Promise<QuestionOption[]> {
    const response = await api.get<QuestionOption[]>(`/questions/${questionId}/options`);
    return response.data;
  },

  async getOptionById(optionId: string): Promise<QuestionOption> {
    const response = await api.get<QuestionOption>(`/options/${optionId}`);
    return response.data;
  },

  async createOption(questionId: string, data: CreateQuestionOptionDTO): Promise<QuestionOption> {
    const response = await api.post<QuestionOption>(`/questions/${questionId}/options`, data);
    return response.data;
  },

  async updateOption(optionId: string, data: UpdateQuestionOptionDTO): Promise<QuestionOption> {
    const response = await api.patch<QuestionOption>(`/options/${optionId}`, data);
    return response.data;
  },

  async deleteOption(optionId: string): Promise<void> {
    await api.delete(`/options/${optionId}`);
  },

  async reorderOptions(questionId: string, data: ReorderQuestionOptionsDTO): Promise<void> {
    await api.patch(`/questions/${questionId}/options/reorder`, data);
  }
};
