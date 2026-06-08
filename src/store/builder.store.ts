import { create } from 'zustand';
import { LocalBlock } from '../domain/block.types';
import { blockService } from '../services/block.service';
import { LocalQuestion, QuestionType } from '../domain/question.types';
import { questionService } from '../services/question.service';

interface BuilderState {
  blocks: LocalBlock[];
  deletedBlockIds: string[];
  
  questions: LocalQuestion[];
  deletedQuestionIds: string[];

  loading: boolean;
  saving: boolean;

  fetchBlocks: (surveyId: string) => Promise<void>;
  
  // Ações de Blocos
  addBlock: () => void;
  updateBlockLocal: (id: string, updates: Partial<LocalBlock>) => void;
  deleteBlockLocal: (id: string) => void;
  reorderBlocksLocal: (newOrder: LocalBlock[]) => void;
  
  // Ações de Perguntas
  addQuestion: (blockId: string, type: QuestionType) => void;
  updateQuestionLocal: (id: string, updates: Partial<LocalQuestion>) => void;
  deleteQuestionLocal: (id: string) => void;
  reorderQuestionsLocal: (blockId: string, newOrder: LocalQuestion[]) => void;

  saveAllBlocks: (surveyId: string) => Promise<void>;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  blocks: [],
  deletedBlockIds: [],
  
  questions: [],
  deletedQuestionIds: [],

  loading: false,
  saving: false,

  fetchBlocks: async (surveyId: string) => {
    set({ loading: true, deletedBlockIds: [], deletedQuestionIds: [] });
    try {
      // 1. Busca Blocos
      const response = await blockService.getBlocks(surveyId);
      const localBlocks: LocalBlock[] = response.map(b => ({
        id: b.id,
        title: b.title || "",
        description: b.description || "",
        orderIndex: b.orderIndex,
        isNew: false
      }));
      set({ blocks: localBlocks });

      // 2. Busca Perguntas de cada Bloco (em paralelo)
      const allQuestions = await Promise.all(
        localBlocks.map(b => questionService.getQuestionsByBlock(b.id))
      );
      
      const localQuestions: LocalQuestion[] = allQuestions.flat().map(q => ({
        id: q.id,
        title: q.title,
        description: q.description || "",
        type: q.type,
        isRequired: q.isRequired,
        orderIndex: q.orderIndex,
        blockId: q.blockId,
        scaleStart: q.scaleStart,
        scaleEnd: q.scaleEnd,
        scaleVisualType: q.scaleVisualType,
        isNew: false
      }));
      
      set({ questions: localQuestions });

    } finally {
      set({ loading: false });
    }
  },

  // === AÇÕES DE BLOCOS ===

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
    const { blocks, deletedBlockIds, questions, deletedQuestionIds } = get();
    const blockToDelete = blocks.find(b => b.id === id);
    
    // Marca o bloco para deleção se existir no banco
    if (blockToDelete && !blockToDelete.isNew) {
      set({ deletedBlockIds: [...deletedBlockIds, id] });
    }
    
    // Todas as perguntas atreladas ao bloco também devem ser apagadas visualmente e fisicamente
    const questionsToDelete = questions.filter(q => q.blockId === id);
    const newDeletedQuestionIds = [...deletedQuestionIds];
    questionsToDelete.forEach(q => {
      if (!q.isNew) newDeletedQuestionIds.push(q.id);
    });

    const remainingBlocks = blocks.filter(b => b.id !== id);
    const reorderedBlocks = remainingBlocks.map((b, index) => ({ ...b, orderIndex: index }));
    const remainingQuestions = questions.filter(q => q.blockId !== id);
    
    set({ 
      blocks: reorderedBlocks, 
      questions: remainingQuestions, 
      deletedQuestionIds: newDeletedQuestionIds 
    });
  },

  reorderBlocksLocal: (newOrder: LocalBlock[]) => {
    const updatedOrder = newOrder.map((b, index) => ({ ...b, orderIndex: index }));
    set({ blocks: updatedOrder });
  },

  // === AÇÕES DE PERGUNTAS ===

  addQuestion: (blockId: string, type: QuestionType) => {
    const { questions } = get();
    const blockQuestions = questions.filter(q => q.blockId === blockId);
    
    const newQuestion: LocalQuestion = {
      id: crypto.randomUUID(),
      blockId,
      title: `Nova Pergunta`,
      description: "",
      type,
      isRequired: true,
      orderIndex: blockQuestions.length,
      isNew: true
    };
    set({ questions: [...questions, newQuestion] });
  },

  updateQuestionLocal: (id: string, updates: Partial<LocalQuestion>) => {
    set((state) => ({
      questions: state.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    }));
  },

  deleteQuestionLocal: (id: string) => {
    const { questions, deletedQuestionIds } = get();
    const questionToDelete = questions.find(q => q.id === id);
    
    if (questionToDelete && !questionToDelete.isNew) {
      set({ deletedQuestionIds: [...deletedQuestionIds, id] });
    }
    
    const remainingQuestions = questions.filter(q => q.id !== id);
    // Precisamos reordenar apenas as perguntas do MESMO bloco da que foi removida
    const blockId = questionToDelete?.blockId;
    if (blockId) {
      const blockQuestions = remainingQuestions
        .filter(q => q.blockId === blockId)
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((q, index) => ({ ...q, orderIndex: index }));
      
      const otherQuestions = remainingQuestions.filter(q => q.blockId !== blockId);
      set({ questions: [...otherQuestions, ...blockQuestions] });
    } else {
      set({ questions: remainingQuestions });
    }
  },

  reorderQuestionsLocal: (blockId: string, newOrder: LocalQuestion[]) => {
    const { questions } = get();
    // Atualiza apenas os indexes das perguntas que mudaram naquele bloco
    const updatedOrder = newOrder.map((q, index) => ({ ...q, orderIndex: index }));
    
    const otherQuestions = questions.filter(q => q.blockId !== blockId);
    set({ questions: [...otherQuestions, ...updatedOrder] });
  },

  // === SINCRONIZAÇÃO EM BATCH ===

  saveAllBlocks: async (surveyId: string) => {
    const { blocks, deletedBlockIds, questions, deletedQuestionIds } = get();
    set({ saving: true });

    try {
      // 1. Apaga no BD as perguntas marcadas
      for (const id of deletedQuestionIds) {
        await questionService.deleteQuestion(id);
      }

      // 2. Apaga no BD os blocos marcados
      for (const id of deletedBlockIds) {
        await blockService.deleteBlock(id);
      }

      // 3. Cria ou Atualiza os blocos e pega as IDs reais
      const newBlockIdMap = new Map<string, string>(); // Mapeia ID Falso -> ID Real
      
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

      const syncedBlocks = blocks.map(b => {
        if (b.isNew && newBlockIdMap.has(b.id)) {
          return { ...b, id: newBlockIdMap.get(b.id)!, isNew: false };
        }
        return b;
      });
      set({ blocks: syncedBlocks, deletedBlockIds: [] });

      // 4. Cria ou Atualiza as perguntas
      const newQuestionIdMap = new Map<string, string>();

      for (const question of questions) {
        // Se a pergunta estiver em um bloco que ACABOU de ser criado, atualiza o blockId dela para o Real
        const actualBlockId = newBlockIdMap.get(question.blockId) || question.blockId;
        
        const payload = {
          title: question.title,
          description: question.description || undefined,
          type: question.type,
          isRequired: question.isRequired,
          scaleStart: question.scaleStart || undefined,
          scaleEnd: question.scaleEnd || undefined,
          scaleVisualType: question.scaleVisualType || undefined
        };

        if (question.isNew) {
          const created = await questionService.createQuestion(actualBlockId, payload);
          newQuestionIdMap.set(question.id, created.id);
        } else {
          await questionService.updateQuestion(question.id, payload);
        }
      }

      const syncedQuestions = questions.map(q => {
        let updatedQ = { ...q, blockId: newBlockIdMap.get(q.blockId) || q.blockId };
        if (q.isNew && newQuestionIdMap.has(q.id)) {
          updatedQ = { ...updatedQ, id: newQuestionIdMap.get(q.id)!, isNew: false };
        }
        return updatedQ;
      });
      set({ questions: syncedQuestions, deletedQuestionIds: [] });

      // 5. Reordena Blocos se necessário
      if (syncedBlocks.length > 0) {
        await blockService.reorderBlocks(surveyId, {
          blocks: syncedBlocks.map(b => ({
            id: b.id,
            orderIndex: b.orderIndex
          }))
        });
      }

      // 6. Reordena Perguntas dentro de cada Bloco (se houver perguntas)
      for (const block of syncedBlocks) {
        const blockQuestions = syncedQuestions.filter(q => q.blockId === block.id);
        if (blockQuestions.length > 0) {
          await questionService.reorderQuestions(block.id, {
            questions: blockQuestions.map(q => ({
              id: q.id,
              orderIndex: q.orderIndex
            }))
          });
        }
      }

    } finally {
      set({ saving: false });
    }
  }
}));
