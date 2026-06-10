export type MediaType = "IMAGE" | "VIDEO" | "AUDIO";

export interface Media {
  id: string;
  type: MediaType;
  url: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  questionId: string;
  createdAt: string;
}

export interface UploadMediaResponseDTO {
  id: string;
  type: MediaType;
  url: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  questionId: string;
  storageKey: string;
  createdAt: string;
}

export const MEDIA_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10 MB
  AUDIO: 50 * 1024 * 1024, // 50 MB
  VIDEO: 200 * 1024 * 1024 // 200 MB
};

export const ALLOWED_MIME_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime']
};
