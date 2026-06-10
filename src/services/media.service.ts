import { api } from './api';
import { Media, UploadMediaResponseDTO } from '../domain/media.types';

export const mediaService = {
  async uploadMedia(questionId: string, file: File, onProgress?: (progress: number) => void): Promise<UploadMediaResponseDTO> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadMediaResponseDTO>(`/questions/${questionId}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  async getQuestionMedia(questionId: string): Promise<Media[]> {
    const response = await api.get<Media[]>(`/questions/${questionId}/media`);
    return response.data;
  },

  async deleteMedia(mediaId: string): Promise<void> {
    await api.delete(`/media/${mediaId}`);
  }
};
