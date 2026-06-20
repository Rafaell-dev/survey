import { api } from "./api";
import { Report, CreateReportDTO, UpdateReportDTO } from "@/domain/report.types";

export const ReportService = {
  async getReports(surveyId: string): Promise<Report[]> {
    const { data } = await api.get(`/surveys/${surveyId}/reports`);
    return data;
  },

  async getReport(surveyId: string, reportId: string): Promise<Report> {
    const { data } = await api.get(`/surveys/${surveyId}/reports/${reportId}`);
    return data;
  },

  async createReport(surveyId: string, payload: CreateReportDTO): Promise<Report> {
    const { data } = await api.post(`/surveys/${surveyId}/reports`, payload);
    return data;
  },

  async updateReport(surveyId: string, reportId: string, payload: UpdateReportDTO): Promise<Report> {
    const { data } = await api.put(`/surveys/${surveyId}/reports/${reportId}`, payload);
    return data;
  },

  async deleteReport(surveyId: string, reportId: string): Promise<void> {
    await api.delete(`/surveys/${surveyId}/reports/${reportId}`);
  }
};
