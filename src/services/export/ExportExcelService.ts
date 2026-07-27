import { QuestionAnalyticsDTO } from "@/domain/analytics.types";
import ExcelJS from "exceljs";
import { downloadFile, sanitizeFilename } from "./download.utils";
import { parseTextResponses } from "@/components/analytics/text-visualizations/utils";

export class ExportExcelService {
  static async export(surveyName: string, question: QuestionAnalyticsDTO) {
    const filename = `survey-${sanitizeFilename(question.questionTitle || question.blockTitle || "dados")}.xlsx`;
    const isTextQuestion = question.type === 'SHORT_TEXT' || question.type === 'LONG_TEXT';
    const isPerceptionTest = question.type === 'PERCEPTION_TEST';
    const isMonitoredReading = question.type === 'MONITORED_READING';
    
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Plataforma de Pesquisas";
    workbook.created = new Date();

    // 1. Aba de Dados
    const dataSheet = workbook.addWorksheet("Dados");
    
    if (isPerceptionTest) {
      dataSheet.columns = [
        { header: 'Tempo do Video (s)', key: 'time', width: 20 },
        { header: 'Resposta', key: 'response', width: 80 }
      ];
      
      const responses = question.responses || [];
      responses.forEach((responseObj: any) => {
        const rawText = typeof responseObj === 'string' ? responseObj : responseObj.textValue || responseObj.value || responseObj;
        if (typeof rawText === 'string') {
          try {
            const parsed = JSON.parse(rawText);
            if (Array.isArray(parsed)) {
              parsed.forEach((int: any) => {
                dataSheet.addRow({
                  time: int.timeOffsetMs ? (int.timeOffsetMs / 1000).toFixed(1) : '-',
                  response: String(int.answer || "-")
                });
              });
            }
          } catch (e) {}
        }
      });
    } else if (isMonitoredReading) {
      dataSheet.columns = [
        { header: 'Trecho', key: 'trecho', width: 20 },
        { header: 'Palavras Lidas', key: 'palavras', width: 20 },
        { header: 'Tempo Gasto (s)', key: 'time', width: 20 },
        { header: 'Velocidade (PPM)', key: 'ppm', width: 20 }
      ];
      
      const responses = question.responses || [];
      responses.forEach((responseObj: any) => {
        const rawText = typeof responseObj === 'string' ? responseObj : responseObj.textValue || responseObj.value || responseObj;
        if (typeof rawText === 'string') {
          try {
            const parsed = JSON.parse(rawText);
            if (Array.isArray(parsed)) {
              parsed.forEach((segment: any) => {
                const palavras = segment.wordCount || 0;
                const ppm = segment.timeSpentMs > 0 ? Math.round(palavras / (segment.timeSpentMs / 1000 / 60)) : 0;
                dataSheet.addRow({
                  trecho: `Parte ${segment.segmentIndex + 1}`,
                  palavras: palavras,
                  time: segment.timeSpentMs ? (segment.timeSpentMs / 1000).toFixed(1) : '-',
                  ppm: ppm
                });
              });
            }
          } catch (e) {}
        }
      });
    } else if (isTextQuestion) {
      dataSheet.columns = [
        { header: 'Participante', key: 'participant', width: 25 },
        { header: 'Data', key: 'date', width: 20 },
        { header: 'Resposta', key: 'response', width: 80 }
      ];
      
      const responses = parseTextResponses(question.responses);
      responses.forEach(r => {
        dataSheet.addRow({
          participant: r.participant,
          date: new Date(r.date).toLocaleDateString('pt-BR'),
          response: r.text
        });
      });
    } else {
      dataSheet.columns = [
        { header: 'Resposta', key: 'label', width: 40 },
        { header: 'Quantidade', key: 'count', width: 15 },
        { header: 'Percentual', key: 'percentage', width: 15 }
      ];
      
      if (question.options) {
        question.options.forEach(opt => {
          dataSheet.addRow({
            label: opt.label,
            count: opt.count,
            percentage: `${opt.percentage}%`
          });
        });
      }
    }

    // Estilizar cabeçalho da aba de dados
    dataSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    dataSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }; // Indigo 600

    // 2. Aba de Metadados
    const metaSheet = workbook.addWorksheet("Metadados");
    metaSheet.columns = [
      { header: 'Propriedade', key: 'prop', width: 25 },
      { header: 'Valor', key: 'val', width: 60 }
    ];
    
    metaSheet.getRow(1).font = { bold: true };
    metaSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1D5DB' } }; // Gray 300

    const totalResponses = isTextQuestion 
      ? (question.responses?.length || 0) 
      : (question.options?.reduce((acc, curr) => acc + curr.count, 0) || 0);

    metaSheet.addRows([
      { prop: 'Pesquisa', val: surveyName },
      { prop: 'Pergunta', val: question.questionTitle || question.blockTitle },
      { prop: 'Tipo', val: question.type },
      { prop: 'Total de Respostas', val: totalResponses },
      { prop: 'Data de Exportação', val: new Date().toLocaleString('pt-BR') }
    ]);

    // Gerar e Baixar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadFile(filename, blob);
  }
}
