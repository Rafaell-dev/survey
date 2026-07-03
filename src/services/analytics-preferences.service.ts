import { QuestionVisualization } from "@/domain/analytics.types";

export interface AnalyticsVisualizationPreference extends QuestionVisualization {
  surveyId: string;
}

class AnalyticsPreferencesService {
  private getStorageKey(surveyId: string): string {
    return `analytics.preferences.${surveyId}`;
  }

  public loadPreferences(surveyId: string): Record<string, QuestionVisualization> {
    try {
      const stored = localStorage.getItem(this.getStorageKey(surveyId));
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Falha ao carregar preferências do LocalStorage", e);
    }
    return {};
  }

  public savePreference(surveyId: string, questionId: string, pref: QuestionVisualization): void {
    try {
      const currentPreferences = this.loadPreferences(surveyId);
      currentPreferences[questionId] = pref;
      
      localStorage.setItem(this.getStorageKey(surveyId), JSON.stringify(currentPreferences));
    } catch (e) {
      console.warn("Falha ao salvar preferência no LocalStorage", e);
    }
  }

  public restoreDefault(surveyId: string, questionId: string): void {
    try {
      const currentPreferences = this.loadPreferences(surveyId);
      if (currentPreferences[questionId]) {
        delete currentPreferences[questionId];
        localStorage.setItem(this.getStorageKey(surveyId), JSON.stringify(currentPreferences));
      }
    } catch (e) {
      console.warn("Falha ao remover preferência do LocalStorage", e);
    }
  }
}

// Exportamos uma única instância para agir como Singleton
export const analyticsPreferencesService = new AnalyticsPreferencesService();
