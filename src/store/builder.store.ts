import { create } from 'zustand';
import { LocalBlock } from '../domain/block.types';
import { blockService } from '../services/block.service';
import { LocalQuestion, QuestionType } from '../domain/question.types';
import { questionService } from '../services/question.service';
import { LocalOption } from '../domain/question-option.types';
import { questionOptionService } from '../services/question-option.service';
import { surveyService } from '../services/survey.service';
import { mediaService } from '../services/media.service';
import { Media } from '../domain/media.types';
import { ConditionalRule, CreateConditionalRuleDTO, UpdateConditionalRuleDTO } from '../domain/conditional-rule.types';
import { conditionalRuleService } from '../services/conditional-rule.service';

interface BuilderState {
  blocks: LocalBlock[];
  deletedBlockIds: string[];
  
  questions: LocalQuestion[];
  deletedQuestionIds: string[];

  options: LocalOption[];
  deletedOptionIds: string[];

  loading: boolean;
  saving: boolean;
  mediaByQuestion: Record<string, Media[]>;
  rulesByQuestion: Record<string, ConditionalRule[]>;

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

  // Ações de Opções
  addOption: (questionId: string) => void;
  updateOptionLocal: (id: string, updates: Partial<LocalOption>) => void;
  deleteOptionLocal: (id: string) => void;
  reorderOptionsLocal: (questionId: string, newOrder: LocalOption[]) => void;

  saveAllBlocks: (surveyId: string) => Promise<void>;
  
  // Media
  fetchQuestionMedia: (questionId: string) => Promise<void>;
  uploadMediaToQuestion: (questionId: string, file: File, onProgress?: (p: number) => void) => Promise<void>;
  removeMedia: (questionId: string, mediaId: string) => Promise<void>;

  // Rules
  fetchQuestionRules: (questionId: string) => Promise<void>;
  createRule: (questionId: string, dto: CreateConditionalRuleDTO) => Promise<void>;
  updateRule: (questionId: string, ruleId: string, dto: UpdateConditionalRuleDTO) => Promise<void>;
  deleteRule: (questionId: string, ruleId: string) => Promise<void>;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  blocks: [],
  deletedBlockIds: [],
  
  questions: [],
  deletedQuestionIds: [],

  options: [],
  deletedOptionIds: [],

  loading: false,
  saving: false,
  mediaByQuestion: {},
  rulesByQuestion: {},

  fetchBlocks: async (surveyId: string) => {
    set({ loading: true, deletedBlockIds: [], deletedQuestionIds: [], deletedOptionIds: [] });
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

      // 3. Busca Opções de cada Pergunta (em paralelo)
      const allOptions = await Promise.all(
        localQuestions.map(q => questionOptionService.getOptionsByQuestion(q.id))
      );

      const localOptions: LocalOption[] = allOptions.flat().map(o => ({
        id: o.id,
        label: o.label,
        value: o.value,
        orderIndex: o.orderIndex,
        questionId: o.questionId,
        isNew: false
      }));
      set({ options: localOptions });

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
    const { blocks, deletedBlockIds, questions, deletedQuestionIds, options, deletedOptionIds } = get();
    const blockToDelete = blocks.find(b => b.id === id);
    
    if (blockToDelete && !blockToDelete.isNew) {
      set({ deletedBlockIds: [...deletedBlockIds, id] });
    }
    
    const questionsToDelete = questions.filter(q => q.blockId === id);
    const questionIdsToDelete = questionsToDelete.map(q => q.id);
    
    const newDeletedQuestionIds = [...deletedQuestionIds];
    questionsToDelete.forEach(q => {
      if (!q.isNew) newDeletedQuestionIds.push(q.id);
    });

    // Filtra também as opções filhas das perguntas
    const newDeletedOptionIds = [...deletedOptionIds];
    const optionsToDelete = options.filter(o => questionIdsToDelete.includes(o.questionId));
    optionsToDelete.forEach(o => {
      if (!o.isNew) newDeletedOptionIds.push(o.id);
    });

    const remainingBlocks = blocks.filter(b => b.id !== id);
    const reorderedBlocks = remainingBlocks.map((b, index) => ({ ...b, orderIndex: index }));
    const remainingQuestions = questions.filter(q => q.blockId !== id);
    const remainingOptions = options.filter(o => !questionIdsToDelete.includes(o.questionId));
    
    set({ 
      blocks: reorderedBlocks, 
      questions: remainingQuestions, 
      options: remainingOptions,
      deletedQuestionIds: newDeletedQuestionIds,
      deletedOptionIds: newDeletedOptionIds
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
    
    const isScale = type === "LIKERT" || type === "SLIDER";

    const newQuestion: LocalQuestion = {
      id: crypto.randomUUID(),
      blockId,
      title: `Nova Pergunta`,
      description: "",
      type,
      isRequired: true,
      orderIndex: blockQuestions.length,
      isNew: true,
      ...(isScale ? { scaleStart: 1, scaleEnd: 5, scaleVisualType: "NUMBERS" } : {})
    };
    set({ questions: [...questions, newQuestion] });
  },

  updateQuestionLocal: (id: string, updates: Partial<LocalQuestion>) => {
    set((state) => ({
      questions: state.questions.map(q => {
        if (q.id !== id) return q;

        let newQuestion = { ...q, ...updates };

        // Se estiver trocando o tipo de uma pergunta que não era escala para uma que É escala, forçamos os valores iniciais caso não existam
        if (updates.type && (updates.type === "LIKERT" || updates.type === "SLIDER")) {
          if (newQuestion.scaleStart === undefined || newQuestion.scaleStart === null) {
            newQuestion.scaleStart = 1;
            newQuestion.scaleEnd = 5;
            newQuestion.scaleVisualType = "NUMBERS";
          }
        }

        return newQuestion;
      })
    }));
  },

  deleteQuestionLocal: (id: string) => {
    const { questions, deletedQuestionIds, options, deletedOptionIds } = get();
    const questionToDelete = questions.find(q => q.id === id);
    
    if (questionToDelete && !questionToDelete.isNew) {
      set({ deletedQuestionIds: [...deletedQuestionIds, id] });
    }

    const optionsToDelete = options.filter(o => o.questionId === id);
    const newDeletedOptionIds = [...deletedOptionIds];
    optionsToDelete.forEach(o => {
      if (!o.isNew) newDeletedOptionIds.push(o.id);
    });
    
    const remainingQuestions = questions.filter(q => q.id !== id);
    const remainingOptions = options.filter(o => o.questionId !== id);

    const blockId = questionToDelete?.blockId;
    if (blockId) {
      const blockQuestions = remainingQuestions
        .filter(q => q.blockId === blockId)
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((q, index) => ({ ...q, orderIndex: index }));
      
      const otherQuestions = remainingQuestions.filter(q => q.blockId !== blockId);
      set({ questions: [...otherQuestions, ...blockQuestions], options: remainingOptions, deletedOptionIds: newDeletedOptionIds });
    } else {
      set({ questions: remainingQuestions, options: remainingOptions, deletedOptionIds: newDeletedOptionIds });
    }
  },

  reorderQuestionsLocal: (blockId: string, newOrder: LocalQuestion[]) => {
    const { questions } = get();
    const updatedOrder = newOrder.map((q, index) => ({ ...q, orderIndex: index }));
    const otherQuestions = questions.filter(q => q.blockId !== blockId);
    set({ questions: [...otherQuestions, ...updatedOrder] });
  },

  // === AÇÕES DE OPÇÕES ===

  addOption: (questionId: string) => {
    const { options } = get();
    const questionOptions = options.filter(o => o.questionId === questionId);
    
    const newOption: LocalOption = {
      id: crypto.randomUUID(),
      questionId,
      label: `Opção ${questionOptions.length + 1}`,
      orderIndex: questionOptions.length,
      isNew: true
    };
    set({ options: [...options, newOption] });
  },

  updateOptionLocal: (id: string, updates: Partial<LocalOption>) => {
    set((state) => ({
      options: state.options.map(o => o.id === id ? { ...o, ...updates } : o)
    }));
  },

  deleteOptionLocal: (id: string) => {
    const { options, deletedOptionIds } = get();
    const optionToDelete = options.find(o => o.id === id);
    
    if (optionToDelete && !optionToDelete.isNew) {
      set({ deletedOptionIds: [...deletedOptionIds, id] });
    }
    
    const remainingOptions = options.filter(o => o.id !== id);
    const questionId = optionToDelete?.questionId;
    if (questionId) {
      const qOptions = remainingOptions
        .filter(o => o.questionId === questionId)
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((o, index) => ({ ...o, orderIndex: index }));
      
      const otherOptions = remainingOptions.filter(o => o.questionId !== questionId);
      set({ options: [...otherOptions, ...qOptions] });
    } else {
      set({ options: remainingOptions });
    }
  },

  reorderOptionsLocal: (questionId: string, newOrder: LocalOption[]) => {
    const { options } = get();
    const updatedOrder = newOrder.map((o, index) => ({ ...o, orderIndex: index }));
    const otherOptions = options.filter(o => o.questionId !== questionId);
    set({ options: [...otherOptions, ...updatedOrder] });
  },

  // === SINCRONIZAÇÃO EM BATCH OTIMIZADA (TREE SYNC) ===

  saveAllBlocks: async (surveyId: string) => {
    const { blocks, deletedBlockIds, questions, deletedQuestionIds, options, deletedOptionIds } = get();
    set({ saving: true });

    try {
      // Monta a árvore completa para enviar de uma só vez
      const payload = {
        deletedBlockIds,
        deletedQuestionIds,
        deletedOptionIds,
        blocks: blocks.map(b => ({
          id: b.id,
          isNew: b.isNew,
          title: b.title,
          description: b.description,
          orderIndex: b.orderIndex,
          questions: questions.filter(q => q.blockId === b.id).map(q => ({
            id: q.id,
            isNew: q.isNew,
            title: q.title,
            description: q.description,
            type: q.type,
            isRequired: q.isRequired,
            orderIndex: q.orderIndex,
            scaleStart: q.scaleStart,
            scaleEnd: q.scaleEnd,
            scaleVisualType: q.scaleVisualType,
            options: options.filter(o => o.questionId === q.id).map(o => ({
              id: o.id,
              isNew: o.isNew,
              label: o.label,
              value: o.value,
              orderIndex: o.orderIndex
            }))
          }))
        }))
      };

      // Única requisição pro backend
      const tree: any[] = await surveyService.syncSurveyTree(surveyId, payload);

      // Re-hidrata a store local com a "Verdade" do Banco de Dados
      const newBlocks = tree.map((b: any) => ({
        id: b.id,
        title: b.title || "",
        description: b.description || "",
        orderIndex: b.orderIndex,
        isNew: false
      }));

      const newQuestions = tree.flatMap((b: any) => b.questions).map((q: any) => ({
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

      const newOptions = tree.flatMap((b: any) => b.questions).flatMap((q: any) => q.options).map((o: any) => ({
        id: o.id,
        label: o.label,
        value: o.value,
        orderIndex: o.orderIndex,
        questionId: o.questionId,
        isNew: false
      }));

      set({
        blocks: newBlocks,
        questions: newQuestions,
        options: newOptions,
        deletedBlockIds: [],
        deletedQuestionIds: [],
        deletedOptionIds: []
      });

    } finally {
      set({ saving: false });
    }
  },

  // MEDIA ACTIONS
  fetchQuestionMedia: async (questionId: string) => {
    try {
      const mediaList = await mediaService.getQuestionMedia(questionId);
      set((state) => ({
        mediaByQuestion: {
          ...state.mediaByQuestion,
          [questionId]: mediaList
        }
      }));
    } catch (err) {
      console.error("Erro ao buscar mídias:", err);
      throw err;
    }
  },

  uploadMediaToQuestion: async (questionId: string, file: File, onProgress?: (p: number) => void) => {
    try {
      const newMedia = await mediaService.uploadMedia(questionId, file, onProgress);
      set((state) => {
        const currentList = state.mediaByQuestion[questionId] || [];
        return {
          mediaByQuestion: {
            ...state.mediaByQuestion,
            [questionId]: [...currentList, newMedia as Media]
          }
        };
      });
    } catch (err) {
      console.error("Erro no upload de mídia:", err);
      throw err;
    }
  },

  removeMedia: async (questionId: string, mediaId: string) => {
    try {
      await mediaService.deleteMedia(mediaId);
      set((state) => {
        const currentList = state.mediaByQuestion[questionId] || [];
        return {
          mediaByQuestion: {
            ...state.mediaByQuestion,
            [questionId]: currentList.filter(m => m.id !== mediaId)
          }
        };
      });
    } catch (err) {
      console.error("Erro ao deletar mídia:", err);
      throw err;
    }
  },

  // RULES ACTIONS
  fetchQuestionRules: async (questionId: string) => {
    try {
      const rules = await conditionalRuleService.getRulesByQuestion(questionId);
      set((state) => ({
        rulesByQuestion: {
          ...state.rulesByQuestion,
          [questionId]: rules
        }
      }));
    } catch (err) {
      console.error("Erro ao buscar regras:", err);
      throw err;
    }
  },

  createRule: async (questionId: string, dto: CreateConditionalRuleDTO) => {
    try {
      const newRule = await conditionalRuleService.createRule(questionId, dto);
      set((state) => {
        const currentList = state.rulesByQuestion[questionId] || [];
        return {
          rulesByQuestion: {
            ...state.rulesByQuestion,
            [questionId]: [...currentList, newRule]
          }
        };
      });
    } catch (err) {
      console.error("Erro ao criar regra:", err);
      throw err;
    }
  },

  updateRule: async (questionId: string, ruleId: string, dto: UpdateConditionalRuleDTO) => {
    try {
      const updatedRule = await conditionalRuleService.updateRule(ruleId, dto);
      set((state) => {
        const currentList = state.rulesByQuestion[questionId] || [];
        return {
          rulesByQuestion: {
            ...state.rulesByQuestion,
            [questionId]: currentList.map(r => r.id === ruleId ? { ...r, ...updatedRule } : r)
          }
        };
      });
    } catch (err) {
      console.error("Erro ao atualizar regra:", err);
      throw err;
    }
  },

  deleteRule: async (questionId: string, ruleId: string) => {
    try {
      await conditionalRuleService.deleteRule(ruleId);
      set((state) => {
        const currentList = state.rulesByQuestion[questionId] || [];
        return {
          rulesByQuestion: {
            ...state.rulesByQuestion,
            [questionId]: currentList.filter(r => r.id !== ruleId)
          }
        };
      });
    } catch (err) {
      console.error("Erro ao deletar regra:", err);
      throw err;
    }
  }
}));
