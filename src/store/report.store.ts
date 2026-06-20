import { create } from "zustand";
import { ReportService } from "@/services/report.service";
import { Report, CreateReportDTO, UpdateReportDTO } from "@/domain/report.types";

interface ReportStore {
  reports: Report[];
  currentReport: Report | null;
  loading: boolean;
  error: string | null;

  loadReports: (surveyId: string) => Promise<void>;
  loadReport: (surveyId: string, reportId: string) => Promise<void>;
  createReport: (surveyId: string, payload: CreateReportDTO) => Promise<Report>;
  updateReport: (surveyId: string, reportId: string, payload: UpdateReportDTO) => Promise<void>;
  deleteReport: (surveyId: string, reportId: string) => Promise<void>;
  
  setCurrentReport: (report: Report | null) => void;
  reset: () => void;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: [],
  currentReport: null,
  loading: false,
  error: null,

  loadReports: async (surveyId) => {
    set({ loading: true, error: null });
    try {
      const reports = await ReportService.getReports(surveyId);
      set({ reports, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Erro ao carregar relatórios", loading: false });
    }
  },

  loadReport: async (surveyId, reportId) => {
    set({ loading: true, error: null });
    try {
      const report = await ReportService.getReport(surveyId, reportId);
      set({ currentReport: report, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Erro ao carregar relatório", loading: false });
    }
  },

  createReport: async (surveyId, payload) => {
    set({ loading: true, error: null });
    try {
      const report = await ReportService.createReport(surveyId, payload);
      set(state => ({ 
        reports: [report, ...state.reports],
        currentReport: report,
        loading: false 
      }));
      return report;
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Erro ao criar relatório", loading: false });
      throw err;
    }
  },

  updateReport: async (surveyId, reportId, payload) => {
    set({ loading: true, error: null });
    try {
      const updated = await ReportService.updateReport(surveyId, reportId, payload);
      set(state => ({
        reports: state.reports.map(r => r.id === reportId ? updated : r),
        currentReport: state.currentReport?.id === reportId ? updated : state.currentReport,
        loading: false
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Erro ao atualizar relatório", loading: false });
      throw err;
    }
  },

  deleteReport: async (surveyId, reportId) => {
    set({ loading: true, error: null });
    try {
      await ReportService.deleteReport(surveyId, reportId);
      set(state => ({
        reports: state.reports.filter(r => r.id !== reportId),
        currentReport: state.currentReport?.id === reportId ? null : state.currentReport,
        loading: false
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Erro ao deletar relatório", loading: false });
      throw err;
    }
  },

  setCurrentReport: (report) => set({ currentReport: report }),
  
  reset: () => set({ reports: [], currentReport: null, loading: false, error: null })
}));
