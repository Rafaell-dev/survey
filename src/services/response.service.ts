import { api } from './api';
import { CompletionResponseDTO } from '../domain/completion.types';

export const responseService = {
  finishResponse: async (responseId: string): Promise<CompletionResponseDTO> => {
    const response = await api.post(`/public/responses/${responseId}/finish`);
    return response.data;
  },
  interruptResponse: async (responseId: string): Promise<any> => {
    const response = await api.post(`/public/responses/${responseId}/interrupt`);
    return response.data;
  }
};
