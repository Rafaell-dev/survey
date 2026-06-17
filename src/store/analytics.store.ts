import { create } from 'zustand';
import { analyticsService } from '../services/analytics.service';
import { 
  AnalyticsOverviewDTO, 
  QuestionsAnalyticsResponseDTO, 
  NavigationAnalyticsResponseDTO, 
  MediaAnalyticsResponseDTO 
} from '../domain/analytics.types';

interface AnalyticsState {
  overview: AnalyticsOverviewDTO | null;
  questions: QuestionsAnalyticsResponseDTO | null;
  navigation: NavigationAnalyticsResponseDTO | null;
  media: MediaAnalyticsResponseDTO | null;
  
  loading: boolean;
  error: string | null;

  loadAnalytics: (surveyId: string) => Promise<void>;
  reset: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  overview: null,
  questions: null,
  navigation: null,
  media: null,
  
  loading: false,
  error: null,

  loadAnalytics: async (surveyId: string) => {
    set({ loading: true, error: null });
    try {
      const [overview, questions, navigation, media] = await Promise.all([
        analyticsService.getOverview(surveyId),
        analyticsService.getQuestions(surveyId),
        analyticsService.getNavigation(surveyId),
        analyticsService.getMedia(surveyId)
      ]);

      set({
        overview,
        questions,
        navigation,
        media,
        loading: false
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Erro ao carregar resultados e analytics.',
        loading: false
      });
    }
  },

  reset: () => {
    set({
      overview: null,
      questions: null,
      navigation: null,
      media: null,
      loading: false,
      error: null
    });
  }
}));
