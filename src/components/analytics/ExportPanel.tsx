"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportService } from "@/services/export.service";
import { ExportFormat } from "@/domain/export.types";

export function ExportPanel({ surveyId }: { surveyId: string }) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(format);
    const toastId = toast.loading(`Gerando arquivo ${format}...`);
    
    try {
      await ExportService.downloadSurveyResults(surveyId, format);
      toast.success(`Arquivo ${format} gerado com sucesso!`, { id: toastId });
    } catch (error: any) {
      console.error(error);
      const message = error?.response?.data?.message || "Não foi possível gerar o arquivo.";
      toast.error(message, { id: toastId });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg bg-card">
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Resultados
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Baixe todos os dados consolidados desta pesquisa.
        </p>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleExport("CSV")}
          disabled={isExporting !== null}
          className="flex-1 sm:flex-none gap-2"
        >
          {isExporting === "CSV" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          CSV
        </Button>

        <Button 
          variant="outline"
          size="sm"
          onClick={() => handleExport("XLSX")}
          disabled={isExporting !== null}
          className="flex-1 sm:flex-none gap-2"
        >
          {isExporting === "XLSX" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
          Excel (XLSX)
        </Button>
      </div>
    </div>
  );
}
