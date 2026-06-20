import { api } from "./api";
import { SurveyTheme, UpdateThemeDTO } from "@/domain/theme.types";

export const ThemeService = {
  async getTheme(surveyId: string): Promise<SurveyTheme> {
    const response = await api.get(`/surveys/${surveyId}/theme`);
    return response.data;
  },

  async updateTheme(surveyId: string, data: UpdateThemeDTO): Promise<SurveyTheme> {
    const response = await api.put(`/surveys/${surveyId}/theme`, data);
    return response.data;
  },

  async uploadHeaderImage(surveyId: string, file: File): Promise<SurveyTheme> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/surveys/${surveyId}/theme/media`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
};
