import { api } from './api';

export interface ScaleOptionItemDTO {
  numericValue: number;
  label?: string;
  emoji?: string;
  icon?: string;
}

export interface ScaleOptionsPayloadDTO {
  options: ScaleOptionItemDTO[];
}

export const scaleOptionService = {
  async getScaleOptions(questionId: string): Promise<ScaleOptionItemDTO[]> {
    const response = await api.get<ScaleOptionItemDTO[]>(`/questions/${questionId}/scale-options`);
    return response.data;
  },

  async updateScaleOptions(questionId: string, data: ScaleOptionsPayloadDTO): Promise<ScaleOptionItemDTO[]> {
    const response = await api.put<ScaleOptionItemDTO[]>(`/questions/${questionId}/scale-options`, data);
    return response.data;
  }
};
