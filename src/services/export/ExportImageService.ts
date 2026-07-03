import { QuestionAnalyticsDTO } from "@/domain/analytics.types";
import { downloadFile, sanitizeFilename } from "./download.utils";
import * as echarts from "echarts";

export class ExportImageService {
  static async export(question: QuestionAnalyticsDTO, cardRef?: React.RefObject<HTMLDivElement | null>) {
    if (!cardRef || !cardRef.current) {
      throw new Error("Referência do card não encontrada.");
    }

    // Procura por qualquer div que possa conter a instância do ECharts
    const echartsContainers = Array.from(cardRef.current.querySelectorAll('div'));
    let chartInstance = null;
    
    for (const container of echartsContainers) {
      const instance = echarts.getInstanceByDom(container as HTMLElement);
      if (instance) {
        chartInstance = instance;
        break;
      }
    }

    if (!chartInstance) {
      throw new Error("Gráfico não encontrado ou não renderizado ainda.");
    }

    const dataUrl = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2, // Alta resolução
      backgroundColor: '#ffffff'
    });

    const filename = `survey-${sanitizeFilename(question.questionTitle || question.blockTitle || "grafico")}.png`;
    downloadFile(filename, dataUrl);
  }
}
