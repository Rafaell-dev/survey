import { create } from 'zustand';
import { LocalBlock } from '../domain/block.types';
import { blockService } from '../services/block.service';

interface BuilderState {
  blocks: LocalBlock[];
  deletedBlockIds: string[];
  loading: boolean;
  saving: boolean;

  fetchBlocks: (surveyId: string) => Promise<void>;
  addBlock: () => void;
  updateBlockLocal: (id: string, updates: Partial<LocalBlock>) => void;
  deleteBlockLocal: (id: string) => void;
  reorderBlocksLocal: (newOrder: LocalBlock[]) => void;
  
  saveAllBlocks: (surveyId: string) => Promise<void>;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  blocks: [],
  deletedBlockIds: [],
  loading: false,
  saving: false,

  fetchBlocks: async (surveyId: string) => {
    set({ loading: true, deletedBlockIds: [] });
    try {
      const response = await blockService.getBlocks(surveyId);
      // Converte os blocos da API para o tipo LocalBlock
      const localBlocks: LocalBlock[] = response.map(b => ({
        id: b.id,
        title: b.title || "",
        description: b.description || "",
        orderIndex: b.orderIndex,
        isNew: false
      }));
      set({ blocks: localBlocks });
    } finally {
      set({ loading: false });
    }
  },

  addBlock: () => {
    const { blocks } = get();
    const newBlock: LocalBlock = {
      id: crypto.randomUUID(),
      title: `Bloco ${blocks.length + 1}`,
      description: "",
      orderIndex: blocks.length,
      isNew: true
    };
    set({ blocks: [...blocks, newBlock] });
  },

  updateBlockLocal: (id: string, updates: Partial<LocalBlock>) => {
    set((state) => ({
      blocks: state.blocks.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  },

  deleteBlockLocal: (id: string) => {
    const { blocks, deletedBlockIds } = get();
    const blockToDelete = blocks.find(b => b.id === id);
    
    if (blockToDelete && !blockToDelete.isNew) {
      // Se não for um bloco novo, anota para deleção real no BD depois
      set({ deletedBlockIds: [...deletedBlockIds, id] });
    }
    
    // Remove da interface visual e atualiza a ordem visual
    const remainingBlocks = blocks.filter(b => b.id !== id);
    const reordered = remainingBlocks.map((b, index) => ({ ...b, orderIndex: index }));
    
    set({ blocks: reordered });
  },

  reorderBlocksLocal: (newOrder: LocalBlock[]) => {
    // Atualiza o orderIndex pra bater com o index do array visualmente
    const updatedOrder = newOrder.map((b, index) => ({ ...b, orderIndex: index }));
    set({ blocks: updatedOrder });
  },

  saveAllBlocks: async (surveyId: string) => {
    const { blocks, deletedBlockIds } = get();
    set({ saving: true });

    try {
      // 1. Apaga no BD os blocos marcados
      for (const id of deletedBlockIds) {
        await blockService.deleteBlock(id);
      }

      // 2. Cria ou Atualiza os blocos
      const newBlockIdMap = new Map<string, string>(); // Mapeia Fake ID para Real ID
      
      for (const block of blocks) {
        if (block.isNew) {
          const created = await blockService.createBlock(surveyId, {
            title: block.title,
            description: block.description
          });
          newBlockIdMap.set(block.id, created.id);
        } else {
          await blockService.updateBlock(block.id, {
            title: block.title,
            description: block.description
          });
        }
      }

      // Atualizamos a ID dos novos no array state e na variável pra reorder
      const syncedBlocks = blocks.map(b => {
        if (b.isNew && newBlockIdMap.has(b.id)) {
          return { ...b, id: newBlockIdMap.get(b.id)!, isNew: false };
        }
        return b;
      });
      set({ blocks: syncedBlocks, deletedBlockIds: [] });

      // 3. Aplica a Reordenação de tudo caso exista ao menos 1 bloco e a ordem precise ser garantida
      if (syncedBlocks.length > 0) {
        await blockService.reorderBlocks(surveyId, {
          blocks: syncedBlocks.map(b => ({
            id: b.id,
            orderIndex: b.orderIndex
          }))
        });
      }

    } finally {
      set({ saving: false });
    }
  }
}));
