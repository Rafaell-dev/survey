import { api } from './api';
import { CompletionResponseDTO } from '../domain/completion.types';

export const responseService = {
  finishResponse: async (responseId: string): Promise<CompletionResponseDTO> => {
    const response = await api.post(`/public/responses/${responseId}/finish`);
    return response.data;
  }
};
