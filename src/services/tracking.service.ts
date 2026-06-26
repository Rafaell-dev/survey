import { api } from './api';
import { SaveTrackingDTO } from '../domain/tracking.types';

export const trackingService = {
  saveTracking: async (responseId: string, data: SaveTrackingDTO) => {
    const response = await api.post(`/public/responses/${responseId}/tracking`, data);
    return response.data;
  }
};
