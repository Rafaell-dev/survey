import { create } from 'zustand';
import { SurveyPlayerDTO, ConditionalRuleDTO } from '../domain/public-survey.types';
import { CreateParticipantDTO, ResponseSessionDTO } from '../domain/participant.types';
import { publicSurveyService } from '../services/public-survey.service';

type PlayerStep = 'IDENTIFICATION' | 'RESPONDING' | 'FINISHED';

interface SurveyPlayerState {
  survey: SurveyPlayerDTO | null;
  loading: boolean;
  error: string | null;
  
  playerStep: PlayerStep;
  participant: CreateParticipantDTO | null;
  responseSession: ResponseSessionDTO | null;

  currentBlockIndex: number;
  answers: Record<string, any>;
  history: number[]; // Guarda os índices dos blocos visitados para o botão "Anterior"
  
  loadSurvey: (slug: string) => Promise<void>;
  startSession: (data: CreateParticipantDTO) => Promise<void>;
  restoreSession: (surveyId: string) => void;
  clearSession: () => void;
  setAnswer: (questionId: string, value: any) => void;
  goToNextBlock: () => void;
  goToPreviousBlock: () => void;
  finishSurvey: () => void;
}

function evaluateRule(rule: ConditionalRuleDTO, answer: any): boolean {
  if (answer === undefined || answer === null || answer === '') return false;

  const matchValue = rule.matchValue;

  if (Array.isArray(answer)) {
    if (rule.operator === 'EQUALS') return answer.includes(matchValue);
    if (rule.operator === 'NOT_EQUALS') return !answer.includes(matchValue);
    return false;
  }

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
  
  playerStep: 'IDENTIFICATION',
  participant: null,
  responseSession: null,

  currentBlockIndex: 0,
  answers: {},
  history: [],

  loadSurvey: async (slug: string) => {
    set({ loading: true, error: null });
    try {
      const survey = await publicSurveyService.getPublicSurvey(slug);
      
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
        loading: false 
      });

      // Tenta restaurar a sessão do localStorage
      get().restoreSession(survey.id);

    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Erro ao carregar o survey. Ele pode não existir ou estar indisponível.', 
        loading: false 
      });
    }
  },

  startSession: async (data: CreateParticipantDTO) => {
    const { survey } = get();
    if (!survey) return;

    try {
      const session = await publicSurveyService.startResponse(survey.id, data);
      
      // Salva no localStorage para persistência
      if (typeof window !== 'undefined') {
        localStorage.setItem(`survey_session_${survey.id}`, JSON.stringify({
          participant: data,
          session,
          answers: {},
          currentBlockIndex: 0,
          history: []
        }));
      }

      set({
        participant: data,
        responseSession: session,
        playerStep: 'RESPONDING',
        currentBlockIndex: 0,
        history: [],
        answers: {}
      });
    } catch (err: any) {
      throw err;
    }
  },

  restoreSession: (surveyId: string) => {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem(`survey_session_${surveyId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.session && parsed.session.status !== 'COMPLETED') {
          set({
            participant: parsed.participant,
            responseSession: parsed.session,
            answers: parsed.answers || {},
            currentBlockIndex: parsed.currentBlockIndex || 0,
            history: parsed.history || [],
            playerStep: 'RESPONDING'
          });
        }
      } catch (e) {
        console.error("Erro ao restaurar sessão", e);
      }
    } else {
      set({ playerStep: 'IDENTIFICATION' });
    }
  },

  clearSession: () => {
    const { survey } = get();
    if (survey && typeof window !== 'undefined') {
      localStorage.removeItem(`survey_session_${survey.id}`);
    }
    set({
      participant: null,
      responseSession: null,
      playerStep: 'IDENTIFICATION',
      answers: {},
      currentBlockIndex: 0,
      history: []
    });
  },

  setAnswer: (questionId: string, value: any) => {
    set((state) => {
      const newAnswers = { ...state.answers, [questionId]: value };
      
      // Atualiza o localStorage com a nova resposta
      if (state.survey && state.responseSession && typeof window !== 'undefined') {
        const saved = localStorage.getItem(`survey_session_${state.survey.id}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            parsed.answers = newAnswers;
            localStorage.setItem(`survey_session_${state.survey.id}`, JSON.stringify(parsed));
          } catch (e) {}
        }
      }

      return { answers: newAnswers };
    });
  },

  goToNextBlock: () => {
    const { survey, currentBlockIndex, answers, history } = get();
    if (!survey || currentBlockIndex >= survey.blocks.length) return;

    const currentBlock = survey.blocks[currentBlockIndex];
    let nextIndex = currentBlockIndex + 1;

    let ruleFired = false;
    for (const question of currentBlock.questions) {
      if (!question.rules || question.rules.length === 0) continue;
      
      const answer = answers[question.id];
      for (const rule of question.rules) {
        if (evaluateRule(rule, answer)) {
          const targetIndex = survey.blocks.findIndex(b => b.id === rule.targetBlockId);
          if (targetIndex !== -1) {
            nextIndex = targetIndex;
            ruleFired = true;
            break;
          }
        }
      }
      if (ruleFired) break;
    }

    const newHistory = [...history, currentBlockIndex];

    // Persiste o progresso
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`survey_session_${survey.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.currentBlockIndex = nextIndex;
          parsed.history = newHistory;
          localStorage.setItem(`survey_session_${survey.id}`, JSON.stringify(parsed));
        } catch (e) {}
      }
    }

    set({
      history: newHistory,
      currentBlockIndex: nextIndex
    });
  },

  goToPreviousBlock: () => {
    const { history, survey } = get();
    if (history.length === 0) return;

    const newHistory = [...history];
    const prevIndex = newHistory.pop()!;

    if (survey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`survey_session_${survey.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.currentBlockIndex = prevIndex;
          parsed.history = newHistory;
          localStorage.setItem(`survey_session_${survey.id}`, JSON.stringify(parsed));
        } catch (e) {}
      }
    }

    set({
      history: newHistory,
      currentBlockIndex: prevIndex
    });
  },

  finishSurvey: () => {
    const { survey } = get();
    if (survey && typeof window !== 'undefined') {
      // Opcionalmente podemos marcar a sessão como completada no localStorage
      const saved = localStorage.getItem(`survey_session_${survey.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.session) parsed.session.status = 'COMPLETED';
          localStorage.setItem(`survey_session_${survey.id}`, JSON.stringify(parsed));
        } catch (e) {}
      }
    }
    set({ playerStep: 'FINISHED' });
  }
}));
