import { QuestionAnalyticsDTO } from "@/domain/analytics.types";
import { jsPDF } from "jspdf";
import * as echarts from "echarts";
import { toPng } from "html-to-image";
import { downloadFile, sanitizeFilename } from "./download.utils";
import { parseTextResponses } from "@/components/analytics/text-visualizations/utils";

export class ExportPdfService {
  static async export(surveyName: string, question: QuestionAnalyticsDTO, cardRef?: React.RefObject<HTMLDivElement | null>) {
    const filename = `survey-${sanitizeFilename(question.questionTitle || question.blockTitle || "relatorio")}.pdf`;
    const isTextQuestion = question.type === 'SHORT_TEXT' || question.type === 'LONG_TEXT';
    
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = 20;

    // Cabeçalho
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Pesquisa: ${surveyName}`, 15, currentY);
    
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth - 15, currentY, { align: "right" });
    currentY += 15;

    // Título da Pergunta
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    
    const title = question.questionTitle || question.blockTitle || "Sem título";
    const splitTitle = doc.splitTextToSize(title, pageWidth - 30);
    doc.text(splitTitle, 15, currentY);
    currentY += (splitTitle.length * 7) + 5;

    // Quantidade de Respostas
    const totalResponses = isTextQuestion 
      ? (question.responses?.length || 0) 
      : (question.options?.reduce((acc, curr) => acc + curr.count, 0) || 0);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Total de respostas: ${totalResponses}`, 15, currentY);
    currentY += 15;

    if (isTextQuestion) {
      // Exportar como lista de textos
      const responses = parseTextResponses(question.responses);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      for (const r of responses) {
        if (currentY > pageHeight - 30) {
          this.addFooter(doc, pageWidth, pageHeight);
          doc.addPage();
          currentY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.text(r.participant, 15, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(new Date(r.date).toLocaleDateString('pt-BR'), pageWidth - 15, currentY, { align: 'right' });
        currentY += 5;

        const splitResponse = doc.splitTextToSize(r.text, pageWidth - 30);
        doc.text(splitResponse, 15, currentY);
        currentY += (splitResponse.length * 5) + 8;
      }
    } else {
      // Exportar Gráfico e Tabela
      if (cardRef && cardRef.current) {
        // Tentar pegar do ECharts
        const echartsContainers = Array.from(cardRef.current.querySelectorAll('div'));
        let chartInstance = null;
        
        for (const container of echartsContainers) {
          const instance = echarts.getInstanceByDom(container as HTMLElement);
          if (instance) {
            chartInstance = instance;
            break;
          }
        }

        if (chartInstance) {
          const dataUrl = chartInstance.getDataURL({
            type: 'png',
            pixelRatio: 2,
            backgroundColor: '#ffffff'
          });
          
          // Ajustar tamanho da imagem no PDF
          const imgWidth = pageWidth - 30;
          const imgHeight = (chartInstance.getHeight() * imgWidth) / chartInstance.getWidth();
          
          if (currentY + imgHeight > pageHeight - 30) {
            this.addFooter(doc, pageWidth, pageHeight);
            doc.addPage();
            currentY = 20;
          }

          doc.addImage(dataUrl, 'PNG', 15, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 15;
        } else {
          // Fallback para html-to-image (caso não seja echarts puro, ex tabela nativa)
          try {
            const chartEl = cardRef.current.querySelector('.chart-container-class') || cardRef.current; // idealmente buscar elemento filho
            const dataUrl = await toPng(chartEl as HTMLElement, { backgroundColor: '#ffffff' });
            
            const imgWidth = pageWidth - 30;
            const imgHeight = 100; // default height if we cant calc
            
            doc.addImage(dataUrl, 'PNG', 15, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 15;
          } catch (e) {
            console.error("Falha no fallback de imagem para PDF", e);
          }
        }
      }

      // Adicionar dados tabulares curtos abaixo
      if (question.options && currentY < pageHeight - 40) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Resumo de Dados", 15, currentY);
        currentY += 8;

        doc.setFont("helvetica", "normal");
        let i = 0;
        for (const opt of question.options) {
          if (i > 15) break; // Limita para não quebrar página desnecessariamente se tiver muitas opções
          doc.text(`${opt.label}: ${opt.count} (${opt.percentage}%)`, 15, currentY);
          currentY += 6;
          i++;
        }
      }
    }

    this.addFooter(doc, pageWidth, pageHeight);
    
    // Salvar
    const blob = doc.output('blob');
    downloadFile(filename, blob);
  }

  private static addFooter(doc: jsPDF, pageWidth: number, pageHeight: number) {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Gerado por Plataforma de Pesquisas", pageWidth / 2, pageHeight - 10, { align: "center" });
  }
}
