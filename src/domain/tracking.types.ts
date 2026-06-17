export interface BlockTrackingDTO {
  blockId: string;
  orderIndex: number;
  timeSpentMs: number;
}

export interface SaveTrackingDTO {
  blocks: BlockTrackingDTO[];
}
