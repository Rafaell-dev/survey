import { api } from './api';
import { 
  Block, 
  CreateBlockDTO, 
  UpdateBlockDTO, 
  ReorderBlocksDTO 
} from '../domain/block.types';

export const blockService = {
  async getBlocks(surveyId: string): Promise<Block[]> {
    const response = await api.get<Block[]>(`/surveys/${surveyId}/blocks`);
    return response.data;
  },

  async getBlockById(blockId: string): Promise<Block> {
    const response = await api.get<Block>(`/blocks/${blockId}`);
    return response.data;
  },

  async createBlock(surveyId: string, data: CreateBlockDTO): Promise<Block> {
    const response = await api.post<Block>(`/surveys/${surveyId}/blocks`, data);
    return response.data;
  },

  async updateBlock(blockId: string, data: UpdateBlockDTO): Promise<Block> {
    const response = await api.patch<Block>(`/blocks/${blockId}`, data);
    return response.data;
  },

  async deleteBlock(blockId: string): Promise<void> {
    await api.delete(`/blocks/${blockId}`);
  },

  async reorderBlocks(surveyId: string, data: ReorderBlocksDTO): Promise<void> {
    await api.patch(`/surveys/${surveyId}/blocks/reorder`, data);
  }
};
