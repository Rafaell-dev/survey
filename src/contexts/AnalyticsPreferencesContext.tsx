import React, { createContext, useContext, useEffect, useState } from "react";
import { QuestionVisualization } from "@/domain/analytics.types";
import { analyticsPreferencesService } from "@/services/analytics-preferences.service";

interface AnalyticsPreferencesContextData {
  preferences: Record<string, QuestionVisualization>;
  savePreference: (questionId: string, pref: QuestionVisualization) => void;
  restoreDefault: (questionId: string) => void;
  isLoaded: boolean;
}

const AnalyticsPreferencesContext = createContext<AnalyticsPreferencesContextData>({} as AnalyticsPreferencesContextData);

export const AnalyticsPreferencesProvider: React.FC<{ surveyId: string, children: React.ReactNode }> = ({ surveyId, children }) => {
  const [preferences, setPreferences] = useState<Record<string, QuestionVisualization>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Carrega todas as preferências do survey assim que o provider é montado
  useEffect(() => {
    const loadedPrefs = analyticsPreferencesService.loadPreferences(surveyId);
    setPreferences(loadedPrefs);
    setIsLoaded(true);
  }, [surveyId]);

  const savePreference = (questionId: string, pref: QuestionVisualization) => {
    // Atualiza o estado global em memória
    setPreferences(prev => ({ ...prev, [questionId]: pref }));
    // Delega ao serviço para persistir os dados (atualmente via localStorage)
    analyticsPreferencesService.savePreference(surveyId, questionId, pref);
  };

  const restoreDefault = (questionId: string) => {
    // Remove do estado em memória
    setPreferences(prev => {
      const newPrefs = { ...prev };
      delete newPrefs[questionId];
      return newPrefs;
    });
    // Delega ao serviço para limpar a persistência
    analyticsPreferencesService.restoreDefault(surveyId, questionId);
  };

  return (
    <AnalyticsPreferencesContext.Provider value={{ preferences, savePreference, restoreDefault, isLoaded }}>
      {children}
    </AnalyticsPreferencesContext.Provider>
  );
};

export function useAnalyticsPreferences() {
  const context = useContext(AnalyticsPreferencesContext);
  if (Object.keys(context).length === 0) {
    throw new Error("useAnalyticsPreferences deve ser usado dentro de um AnalyticsPreferencesProvider");
  }
  return context;
}
