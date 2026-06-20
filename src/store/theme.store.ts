import { create } from "zustand";
import { SurveyTheme, UpdateThemeDTO } from "@/domain/theme.types";
import { ThemeService } from "@/services/theme.service";
import { toast } from "sonner";

interface ThemeState {
  theme: SurveyTheme | null;
  isLoading: boolean;
  error: string | null;

  loadTheme: (surveyId: string) => Promise<void>;
  updateTheme: (surveyId: string, data: UpdateThemeDTO) => Promise<void>;
  uploadHeaderImage: (surveyId: string, file: File) => Promise<void>;
  
  // Apenas altera o estado local para preview sem salvar no banco (otimista)
  previewTheme: (data: UpdateThemeDTO) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: null,
  isLoading: false,
  error: null,

  loadTheme: async (surveyId) => {
    set({ isLoading: true, error: null });
    try {
      const theme = await ThemeService.getTheme(surveyId);
      set({ theme, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Erro ao carregar tema", isLoading: false });
      toast.error("Não foi possível carregar as configurações do tema.");
    }
  },

  updateTheme: async (surveyId, data) => {
    try {
      const updatedTheme = await ThemeService.updateTheme(surveyId, data);
      set({ theme: updatedTheme });
      toast.success("Tema salvo com sucesso!");
    } catch (err: any) {
      toast.error("Não foi possível salvar personalização.");
      // Rollback se necessário re-carregando o tema
      throw err;
    }
  },

  uploadHeaderImage: async (surveyId, file) => {
    try {
      const updatedTheme = await ThemeService.uploadHeaderImage(surveyId, file);
      set({ theme: updatedTheme });
      toast.success("Imagem de cabeçalho enviada!");
    } catch (err: any) {
      toast.error("Erro ao fazer upload da imagem.");
      throw err;
    }
  },

  previewTheme: (data) => {
    const currentTheme = get().theme;
    if (currentTheme) {
      set({ theme: { ...currentTheme, ...data } });
    }
  }
}));
