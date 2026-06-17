import { api } from './api';
import { SaveMediaTrackingDTO } from '../domain/media-tracking.types';

export const mediaTrackingService = {
  saveMediaInteractions: async (responseId: string, data: SaveMediaTrackingDTO) => {
    const response = await api.post(`/responses/${responseId}/media-tracking`, data);
    return response.data;
  }
};
