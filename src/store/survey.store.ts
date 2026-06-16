import { create } from 'zustand';
import { Survey, CreateSurveyDTO, UpdateSurveyDTO, UpdateSurveySettingsDTO, PublicLinkInfo } from '../domain/survey.types';
import { surveyService } from '../services/survey.service';

interface SurveyState {
  surveys: Survey[];
  selectedSurvey: Survey | null;
  loading: boolean;
  total: number;
  page: number;
  limit: number;

  publicLinkInfo: PublicLinkInfo | null;
  publishing: boolean;
  archiving: boolean;

  fetchSurveys: (page?: number, limit?: number, search?: string) => Promise<void>;
  fetchSurvey: (id: string) => Promise<Survey>;
  createSurvey: (data: CreateSurveyDTO) => Promise<Survey>;
  updateSurvey: (id: string, data: UpdateSurveyDTO) => Promise<Survey>;
  updateSurveySettings: (id: string, data: UpdateSurveySettingsDTO) => Promise<Survey>;
  deleteSurvey: (id: string) => Promise<void>;
  clearSelectedSurvey: () => void;

  publishSurvey: (id: string) => Promise<void>;
  archiveSurvey: (id: string) => Promise<void>;
  loadPublicLink: (id: string) => Promise<void>;
  generatePublicLink: (id: string) => Promise<void>;
}

export const useSurveyStore = create<SurveyState>((set, get) => ({
  surveys: [],
  selectedSurvey: null,
  loading: false,
  total: 0,
  page: 1,
  limit: 20,

  publicLinkInfo: null,
  publishing: false,
  archiving: false,

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

  updateSurveySettings: async (id: string, data: UpdateSurveySettingsDTO) => {
    set({ loading: true });
    try {
      const survey = await surveyService.updateSurveySettings(id, data);
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

  clearSelectedSurvey: () => set({ selectedSurvey: null, publicLinkInfo: null }),

  publishSurvey: async (id: string) => {
    set({ publishing: true });
    try {
      const response = await surveyService.publishSurvey(id);
      set((state) => {
        const updatedSurvey = state.selectedSurvey?.id === id 
          ? { ...state.selectedSurvey, status: response.status as "PUBLISHED", updatedAt: response.publishedAt } 
          : state.selectedSurvey;
        
        return {
          selectedSurvey: updatedSurvey,
          surveys: state.surveys.map(s => s.id === id ? { ...s, status: response.status as "PUBLISHED" } : s)
        };
      });
    } finally {
      set({ publishing: false });
    }
  },

  archiveSurvey: async (id: string) => {
    set({ archiving: true });
    try {
      const response = await surveyService.archiveSurvey(id);
      set((state) => {
        const updatedSurvey = state.selectedSurvey?.id === id 
          ? { ...state.selectedSurvey, status: response.status as "ARCHIVED" } 
          : state.selectedSurvey;
        
        return {
          selectedSurvey: updatedSurvey,
          surveys: state.surveys.map(s => s.id === id ? { ...s, status: response.status as "ARCHIVED" } : s)
        };
      });
    } finally {
      set({ archiving: false });
    }
  },

  loadPublicLink: async (id: string) => {
    try {
      const linkInfo = await surveyService.getPublicLink(id);
      set({ publicLinkInfo: linkInfo });
    } catch (error) {
      console.error("Erro ao carregar link público", error);
      set({ publicLinkInfo: null });
    }
  },

  generatePublicLink: async (id: string) => {
    try {
      const linkInfo = await surveyService.generatePublicLink(id);
      set({ publicLinkInfo: linkInfo });
    } catch (error) {
      console.error("Erro ao gerar link público", error);
      throw error;
    }
  }
}));
