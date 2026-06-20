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

export interface ReportMetricDTO {
  id: string;
  label: string;
  value: number | string;
  description?: string;
  type: "number" | "percentage" | "time" | "currency";
}

export interface ReportFilterDTO {
  status?: "ALL" | "COMPLETED" | "IN_PROGRESS";
  dateRange?: {
    from: string | null;
    to: string | null;
  };
  blockIds?: string[];
  participantIds?: string[];
  selectedQuestions?: string[];
  showMetrics?: boolean;
}

