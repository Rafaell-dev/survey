import { create } from 'zustand';
import { SurveyPlayerDTO, ConditionalRuleDTO } from '../domain/public-survey.types';
import { publicSurveyService } from '../services/public-survey.service';

interface SurveyPlayerState {
  survey: SurveyPlayerDTO | null;
  loading: boolean;
  error: string | null;
  
  currentBlockIndex: number;
  answers: Record<string, any>;
  history: number[]; // Guarda os índices dos blocos visitados para o botão "Anterior"
  
  loadSurvey: (slug: string) => Promise<void>;
  setAnswer: (questionId: string, value: any) => void;
  goToNextBlock: () => void;
  goToPreviousBlock: () => void;
}

function evaluateRule(rule: ConditionalRuleDTO, answer: any): boolean {
  if (answer === undefined || answer === null || answer === '') return false;

  const matchValue = rule.matchValue;

  // Se a resposta for um array (ex: múltipla escolha)
  if (Array.isArray(answer)) {
    if (rule.operator === 'EQUALS') return answer.includes(matchValue);
    if (rule.operator === 'NOT_EQUALS') return !answer.includes(matchValue);
    return false;
  }

  // Comparações de string ou número
  const strAnswer = String(answer);
  const numAnswer = Number(answer);
  const numMatch = Number(matchValue);

  switch (rule.operator) {
    case 'EQUALS':
      return strAnswer === matchValue;
    case 'NOT_EQUALS':
      return strAnswer !== matchValue;
    case 'GREATER_THAN':
      if (!isNaN(numAnswer) && !isNaN(numMatch)) return numAnswer > numMatch;
      return false;
    case 'LESS_THAN':
      if (!isNaN(numAnswer) && !isNaN(numMatch)) return numAnswer < numMatch;
      return false;
    default:
      return false;
  }
}

export const useSurveyPlayerStore = create<SurveyPlayerState>((set, get) => ({
  survey: null,
  loading: true,
  error: null,
  
  currentBlockIndex: 0,
  answers: {},
  history: [],

  loadSurvey: async (slug: string) => {
    set({ loading: true, error: null });
    try {
      const survey = await publicSurveyService.getPublicSurvey(slug);
      
      // Ordena os blocos e as questões de forma garantida pelo orderIndex
      survey.blocks.sort((a, b) => a.orderIndex - b.orderIndex);
      survey.blocks.forEach(block => {
        block.questions.sort((a, b) => a.orderIndex - b.orderIndex);
        block.questions.forEach(q => {
          q.options?.sort((a, b) => a.orderIndex - b.orderIndex);
          q.scaleOptions?.sort((a, b) => a.orderIndex - b.orderIndex);
        });
      });

      set({ 
        survey, 
        currentBlockIndex: 0, 
        answers: {}, 
        history: [],
        loading: false 
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Erro ao carregar o survey. Ele pode não existir ou estar indisponível.', 
        loading: false 
      });
    }
  },

  setAnswer: (questionId: string, value: any) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: value }
    }));
  },

  goToNextBlock: () => {
    const { survey, currentBlockIndex, answers, history } = get();
    if (!survey || currentBlockIndex >= survey.blocks.length) return;

    const currentBlock = survey.blocks[currentBlockIndex];
    let nextIndex = currentBlockIndex + 1;

    // Motor de Regras Condicionais
    // Itera por todas as questões do bloco atual procurando regras
    let ruleFired = false;
    for (const question of currentBlock.questions) {
      if (!question.rules || question.rules.length === 0) continue;
      
      const answer = answers[question.id];
      for (const rule of question.rules) {
        if (evaluateRule(rule, answer)) {
          // Achar o índice do bloco de destino
          const targetIndex = survey.blocks.findIndex(b => b.id === rule.targetBlockId);
          if (targetIndex !== -1) {
            nextIndex = targetIndex;
            ruleFired = true;
            break;
          }
        }
      }
      if (ruleFired) break; // Se disparou uma regra, ignora as demais (apenas 1 destino por vez)
    }

    set({
      history: [...history, currentBlockIndex],
      currentBlockIndex: nextIndex
    });
  },

  goToPreviousBlock: () => {
    const { history } = get();
    if (history.length === 0) return;

    const newHistory = [...history];
    const prevIndex = newHistory.pop()!;

    set({
      history: newHistory,
      currentBlockIndex: prevIndex
    });
  }
}));
