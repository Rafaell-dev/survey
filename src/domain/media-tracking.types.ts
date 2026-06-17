export type MediaInteractionType = 'PLAY' | 'PAUSE' | 'END' | 'CLICK';

export interface MediaInteractionDTO {
  mediaId: string;
  interactionType: MediaInteractionType;
  timeOffsetMs?: number;
}

export interface SaveMediaTrackingDTO {
  interactions: MediaInteractionDTO[];
}
