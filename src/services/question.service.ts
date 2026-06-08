import { api } from './api';
import { 
  Question, 
  CreateQuestionDTO, 
  UpdateQuestionDTO, 
  ReorderQuestionsDTO 
} from '../domain/question.types';

export const questionService = {
  async getQuestionsByBlock(blockId: string): Promise<Question[]> {
    const response = await api.get<Question[]>(`/blocks/${blockId}/questions`);
    return response.data;
  },

  async getQuestionById(questionId: string): Promise<Question> {
    const response = await api.get<Question>(`/questions/${questionId}`);
    return response.data;
  },

  async createQuestion(blockId: string, data: CreateQuestionDTO): Promise<Question> {
    const response = await api.post<Question>(`/blocks/${blockId}/questions`, data);
    return response.data;
  },

  async updateQuestion(questionId: string, data: UpdateQuestionDTO): Promise<Question> {
    const response = await api.patch<Question>(`/questions/${questionId}`, data);
    return response.data;
  },

  async deleteQuestion(questionId: string): Promise<void> {
    await api.delete(`/questions/${questionId}`);
  },

  async reorderQuestions(blockId: string, data: ReorderQuestionsDTO): Promise<void> {
    await api.patch(`/blocks/${blockId}/questions/reorder`, data);
  }
};
