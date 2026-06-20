export interface Report {
  id: string;
  name: string;
  filters: any;
  surveyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportDTO {
  name: string;
  filters: any;
}

export interface UpdateReportDTO {
  name?: string;
  filters?: any;
}
