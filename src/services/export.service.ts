import { api } from "./api";
import { ExportFormat } from "@/domain/export.types";

export const ExportService = {
  /**
   * Baixa os resultados do survey em formato CSV ou XLSX.
   * Utiliza `responseType: 'blob'` para receber o arquivo do backend.
   */
  async downloadSurveyResults(surveyId: string, format: ExportFormat): Promise<void> {
    const url = `/surveys/${surveyId}/export/${format.toLowerCase()}`;
    
    const response = await api.get(url, {
      responseType: 'blob', // Importante para lidar com download de arquivos
    });

    // Identificar o nome do arquivo enviado pelo Content-Disposition, ou criar um fallback
    const contentDisposition = response.headers['content-disposition'];
    let filename = `survey-${surveyId}.${format.toLowerCase()}`;
    
    if (contentDisposition && contentDisposition.includes('filename=')) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }

    // Criar um Blob e forçar o download no navegador
    const blob = new Blob([response.data]);
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Limpar DOM e liberar memória
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  }
};
