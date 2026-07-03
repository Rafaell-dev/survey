import { QuestionAnalyticsDTO } from "@/domain/analytics.types";
import { downloadFile, sanitizeFilename } from "./download.utils";

export class ExportJsonService {
  static export(surveyName: string, question: QuestionAnalyticsDTO) {
    const filename = `survey-${sanitizeFilename(question.questionTitle || question.blockTitle || "pergunta")}.json`;
    
    // Preparar objeto
    const exportData = {
      survey: surveyName,
      question: question.questionTitle || question.blockTitle,
      type: question.type,
      exportedAt: new Date().toISOString(),
      data: question.options || question.responses || []
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    downloadFile(filename, blob);
  }
}
