import { QuestionAnalyticsDTO } from "@/domain/analytics.types";
import { parseTextResponses } from "@/components/analytics/text-visualizations/utils";
import { downloadFile, sanitizeFilename } from "./download.utils";

export class ExportCsvService {
  static export(question: QuestionAnalyticsDTO) {
    const filename = `survey-${sanitizeFilename(question.questionTitle || question.blockTitle || "pergunta")}.csv`;
    let csvContent = "";
    const isTextQuestion = question.type === 'SHORT_TEXT' || question.type === 'LONG_TEXT';

    if (isTextQuestion) {
      // Formato para Texto (Participante, Resposta, Data)
      csvContent = "Participante,Resposta,Data\n";
      const responses = parseTextResponses(question.responses);
      
      responses.forEach(r => {
        // Escapar aspas duplas no CSV
        const escapedText = r.text.replace(/"/g, '""');
        csvContent += `"${r.participant}","${escapedText}","${new Date(r.date).toLocaleDateString('pt-BR')}"\n`;
      });
    } else {
      // Formato para Objetivas (Opção, Quantidade, Percentual)
      csvContent = "Resposta,Quantidade,Percentual\n";
      if (question.options) {
        question.options.forEach(opt => {
          csvContent += `"${opt.label.replace(/"/g, '""')}",${opt.count},${opt.percentage}\n`;
        });
      }
    }

    // Adiciona BOM para UTF-8 compatibilidade com Excel
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(filename, blob);
  }
}
