import { api } from './api';
import { SaveAnswerDTO, AnswerDTO } from '../domain/answer.types';

export const answerService = {
  /**
   * Salva ou atualiza a resposta de uma pergunta na sessão
   */
  async saveAnswer(responseId: string, data: SaveAnswerDTO): Promise<void> {
    await api.post(`/public/responses/${responseId}/answers`, data);
  },

  /**
   * Recupera todas as respostas da sessão
   */
  async getAnswers(responseId: string): Promise<AnswerDTO[]> {
    const response = await api.get<AnswerDTO[]>(`/public/responses/${responseId}/answers`);
    return response.data;
  },

  /**
   * Marca a resposta como completa no backend
   */
  async completeResponse(responseId: string): Promise<void> {
    await api.post(`/public/responses/${responseId}/finish`);
  }
};
