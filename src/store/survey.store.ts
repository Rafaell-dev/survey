import { create } from 'zustand';
import { Survey, CreateSurveyDTO, UpdateSurveyDTO } from '../domain/survey.types';
import { surveyService } from '../services/survey.service';

interface SurveyState {
  surveys: Survey[];
  selectedSurvey: Survey | null;
  loading: boolean;
  total: number;
  page: number;
  limit: number;

  fetchSurveys: (page?: number, limit?: number, search?: string) => Promise<void>;
  fetchSurvey: (id: string) => Promise<Survey>;
  createSurvey: (data: CreateSurveyDTO) => Promise<Survey>;
  updateSurvey: (id: string, data: UpdateSurveyDTO) => Promise<Survey>;
  deleteSurvey: (id: string) => Promise<void>;
  clearSelectedSurvey: () => void;
}

export const useSurveyStore = create<SurveyState>((set, get) => ({
  surveys: [],
  selectedSurvey: null,
  loading: false,
  total: 0,
  page: 1,
  limit: 20,

  fetchSurveys: async (page = 1, limit = 20, search = '') => {
    set({ loading: true });
    try {
      const response = await surveyService.getSurveys(page, limit, search);
      set({ 
        surveys: response.items, 
        total: response.total, 
        page: response.page, 
        limit: response.limit 
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchSurvey: async (id: string) => {
    set({ loading: true });
    try {
      const survey = await surveyService.getSurveyById(id);
      set({ selectedSurvey: survey });
      return survey;
    } finally {
      set({ loading: false });
    }
  },

  createSurvey: async (data: CreateSurveyDTO) => {
    set({ loading: true });
    try {
      const survey = await surveyService.createSurvey(data);
      set((state) => ({ surveys: [survey, ...state.surveys] }));
      return survey;
    } finally {
      set({ loading: false });
    }
  },

  updateSurvey: async (id: string, data: UpdateSurveyDTO) => {
    set({ loading: true });
    try {
      const survey = await surveyService.updateSurvey(id, data);
      set((state) => ({
        surveys: state.surveys.map(s => s.id === id ? survey : s),
        selectedSurvey: state.selectedSurvey?.id === id ? survey : state.selectedSurvey
      }));
      return survey;
    } finally {
      set({ loading: false });
    }
  },

  deleteSurvey: async (id: string) => {
    set({ loading: true });
    try {
      await surveyService.deleteSurvey(id);
      set((state) => ({
        surveys: state.surveys.filter(s => s.id !== id),
        selectedSurvey: state.selectedSurvey?.id === id ? null : state.selectedSurvey
      }));
    } finally {
      set({ loading: false });
    }
  },

  clearSelectedSurvey: () => set({ selectedSurvey: null })
}));
