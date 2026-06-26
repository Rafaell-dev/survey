import { create } from 'zustand';
import { SurveyPlayerDTO, ConditionalRuleDTO, SurveyQuestionDTO } from '../domain/public-survey.types';
import { CreateParticipantDTO, ResponseSessionDTO } from '../domain/participant.types';
import { publicSurveyService } from '../services/public-survey.service';
import { answerService } from '../services/answer.service';
import { responseService } from '../services/response.service';
import { trackingService } from '../services/tracking.service';
import { mediaTrackingService } from '../services/media-tracking.service';
import { SaveAnswerDTO } from '../domain/answer.types';
import { SaveTrackingDTO } from '../domain/tracking.types';
import { MediaInteractionType } from '../domain/media-tracking.types';
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
  
  // Tracking
  currentBlockStartedAt: number | null;
  blockTrackings: Record<string, { orderIndex: number; timeSpentMs: number }>;
  trackedMediaEvents: string[];

  savingAnswers: number;
  saveError: string | null;

  loadSurvey: (slug: string) => Promise<void>;
  startSession: (data: CreateParticipantDTO) => Promise<void>;
  restoreSession: (surveyId: string) => void;
  clearSession: () => void;
  setAnswer: (questionId: string, value: any) => void;
  saveAnswerToApi: (questionId: string, value: any) => void;
  goToNextBlock: () => void;
  goToPreviousBlock: () => void;
  finishSurvey: () => Promise<void>;
  trackBlockStart: () => void;
  trackBlockExit: () => void;
  trackMediaInteraction: (mediaId: string, type: MediaInteractionType, timeOffsetMs?: number) => void;
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

const debounceTimers: Record<string, NodeJS.Timeout> = {};

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
  
  currentBlockStartedAt: null,
  blockTrackings: {},
  trackedMediaEvents: [],
  
  savingAnswers: 0,
  saveError: null,

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
          history: [],
          blockTrackings: {},
          trackedMediaEvents: []
        }));
      }

      set({
        participant: data,
        responseSession: session,
        playerStep: 'RESPONDING',
        currentBlockIndex: 0,
        history: [],
        answers: {},
        blockTrackings: {},
        trackedMediaEvents: [],
        currentBlockStartedAt: null
      });
      get().trackBlockStart();
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
            blockTrackings: parsed.blockTrackings || {},
            trackedMediaEvents: parsed.trackedMediaEvents || [],
            playerStep: 'RESPONDING'
          });
          get().trackBlockStart();
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
      history: [],
      blockTrackings: {},
      trackedMediaEvents: [],
      currentBlockStartedAt: null,
      savingAnswers: 0,
      saveError: null
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

    get().saveAnswerToApi(questionId, value);
  },

  saveAnswerToApi: (questionId: string, value: any) => {
    const { responseSession, survey } = get();
    if (!responseSession || !survey) return;

    if (debounceTimers[questionId]) {
      clearTimeout(debounceTimers[questionId]);
      set((state) => ({ savingAnswers: Math.max(0, state.savingAnswers - 1) }));
    }
    
    set((state) => ({ savingAnswers: state.savingAnswers + 1, saveError: null }));

    debounceTimers[questionId] = setTimeout(async () => {
      try {
        // Encontra a pergunta para saber o tipo
        let question: SurveyQuestionDTO | null = null;
        for (const block of survey.blocks) {
          const found = block.questions.find(q => q.id === questionId);
          if (found) { question = found; break; }
        }
        
        if (!question) return;

        const dto: SaveAnswerDTO = {
          questionId,
          timeSpentMs: 0 // Tracking não é foco no momento
        };

        if (question.type === 'SHORT_TEXT' || question.type === 'LONG_TEXT') {
          dto.textValue = String(value || '');
        } else if (question.type === 'SINGLE_CHOICE') {
          dto.selectedOptionId = value;
        } else if (question.type === 'MULTIPLE_CHOICE') {
          dto.selectedOptionsIds = Array.isArray(value) ? value : [];
        } else if (question.type === 'LIKERT' || question.type === 'SLIDER') {
          dto.numericValue = Number(value);
        }

        // Não salvar caso não haja resposta útil pra enviar
        if (
          dto.textValue === '' || 
          dto.selectedOptionId === '' || 
          (Array.isArray(dto.selectedOptionsIds) && dto.selectedOptionsIds.length === 0)
        ) {
           return;
        }

        await answerService.saveAnswer(responseSession.responseId, dto);
      } catch (err) {
        set({ saveError: 'Não foi possível salvar uma de suas respostas. Verifique sua conexão.' });
      } finally {
        set((state) => ({ savingAnswers: Math.max(0, state.savingAnswers - 1) }));
      }
    }, 800);
  },

  goToNextBlock: () => {
    get().trackBlockExit();
    const { survey, currentBlockIndex, answers, history, blockTrackings } = get();
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
          parsed.blockTrackings = blockTrackings;
          parsed.trackedMediaEvents = get().trackedMediaEvents;
          localStorage.setItem(`survey_session_${survey.id}`, JSON.stringify(parsed));
        } catch (e) {}
      }
    }

    set({
      history: newHistory,
      currentBlockIndex: nextIndex,
      saveError: null
    });
    get().trackBlockStart();
  },

  goToPreviousBlock: () => {
    get().trackBlockExit();
    const { history, survey, blockTrackings } = get();
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
          parsed.blockTrackings = blockTrackings;
          parsed.trackedMediaEvents = get().trackedMediaEvents;
          localStorage.setItem(`survey_session_${survey.id}`, JSON.stringify(parsed));
        } catch (e) {}
      }
    }

    set({
      history: newHistory,
      currentBlockIndex: prevIndex,
      saveError: null
    });
    get().trackBlockStart();
  },

  finishSurvey: async () => {
    get().trackBlockExit();
    const { survey, responseSession, blockTrackings, savingAnswers } = get();
    
    if (savingAnswers > 0) {
      set({ saveError: 'Aguarde o salvamento das respostas antes de finalizar.' });
      return;
    }

    if (responseSession) {
      try {
        await responseService.finishResponse(responseSession.responseId);
      } catch (e: any) {
        set({ saveError: e.response?.data?.message || 'Erro ao finalizar a pesquisa. Verifique sua conexão e tente novamente.' });
        return; // interrompe a finalização se falhar
      }
    }

    if (survey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`survey_session_${survey.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.session) parsed.session.status = 'COMPLETED';
          parsed.blockTrackings = blockTrackings;
          parsed.trackedMediaEvents = get().trackedMediaEvents;
          localStorage.setItem(`survey_session_${survey.id}`, JSON.stringify(parsed));
        } catch (e) {}
      }
    }
    set({ playerStep: 'FINISHED' });
  },

  trackBlockStart: () => {
    set({ currentBlockStartedAt: Date.now() });
  },

  trackBlockExit: () => {
    const { currentBlockIndex, currentBlockStartedAt, blockTrackings, survey, responseSession } = get();
    if (!survey || !currentBlockStartedAt || !responseSession) return;
    
    const currentBlock = survey.blocks[currentBlockIndex];
    if (!currentBlock) return;

    const timeSpent = Date.now() - currentBlockStartedAt;
    const existingTracking = blockTrackings[currentBlock.id];
    
    const orderIndex = existingTracking 
      ? existingTracking.orderIndex 
      : Object.keys(blockTrackings).length + 1;

    const updatedTracking = {
      orderIndex,
      timeSpentMs: (existingTracking?.timeSpentMs || 0) + timeSpent
    };

    const newBlockTrackings = {
      ...blockTrackings,
      [currentBlock.id]: updatedTracking
    };

    set({ blockTrackings: newBlockTrackings, currentBlockStartedAt: null });

    // Enviar tracking de forma silenciosa ("fire and forget") para a API com debounce/sem bloqueio
    const payload: SaveTrackingDTO = {
      blocks: Object.entries(newBlockTrackings).map(([blockId, tracking]) => ({
        blockId,
        orderIndex: tracking.orderIndex,
        timeSpentMs: tracking.timeSpentMs
      }))
    };

    trackingService.saveTracking(responseSession.responseId, payload).catch((e) => {
      console.warn("Tracking error (ignored):", e);
    });
  },

  trackMediaInteraction: (mediaId: string, type: MediaInteractionType, timeOffsetMs?: number) => {
    const { responseSession, trackedMediaEvents, survey } = get();
    if (!responseSession || !survey) return;

    // Controle local de duplicidade para eventos PLAY e END
    const eventKey = `${mediaId}-${type}`;
    if ((type === 'PLAY' || type === 'END') && trackedMediaEvents.includes(eventKey)) {
      return;
    }

    const newTrackedEvents = [...trackedMediaEvents, eventKey];

    // Atualiza estado e localStorage
    set({ trackedMediaEvents: newTrackedEvents });
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`survey_session_${survey.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.trackedMediaEvents = newTrackedEvents;
          localStorage.setItem(`survey_session_${survey.id}`, JSON.stringify(parsed));
        } catch (e) {}
      }
    }

    // Disparo para a API (fire and forget)
    mediaTrackingService.saveMediaInteractions(responseSession.responseId, {
      interactions: [
        {
          mediaId,
          interactionType: type,
          timeOffsetMs: timeOffsetMs !== undefined ? Math.round(timeOffsetMs) : undefined
        }
      ]
    }).catch(e => console.warn("Erro ao salvar media tracking (ignorado):", e));
  }
}));
