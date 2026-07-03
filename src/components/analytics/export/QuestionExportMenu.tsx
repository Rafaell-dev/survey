import { useState } from "react";
import { QuestionAnalyticsDTO } from "@/domain/analytics.types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, FileImage, FileJson, FileSpreadsheet, FileText, Loader2, FileCode2 } from "lucide-react";
import { toast } from "sonner";
import { ExportJsonService } from "@/services/export/ExportJsonService";
import { ExportCsvService } from "@/services/export/ExportCsvService";
import { ExportExcelService } from "@/services/export/ExportExcelService";
import { ExportPdfService } from "@/services/export/ExportPdfService";
import { ExportImageService } from "@/services/export/ExportImageService";

interface QuestionExportMenuProps {
  question: QuestionAnalyticsDTO;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export function QuestionExportMenu({ question, cardRef }: QuestionExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);
  const isTextQuestion = question.type === 'SHORT_TEXT' || question.type === 'LONG_TEXT';

  const handleExport = async (format: 'PNG' | 'PDF' | 'EXCEL' | 'CSV' | 'JSON') => {
    setIsExporting(true);
    
    try {
      // Usar setTimeout para permitir a renderização do estado "Exportando..."
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const surveyName = "Survey Export"; // No futuro pode vir do context
      
      switch (format) {
        case 'JSON':
          ExportJsonService.export(surveyName, question);
          break;
        case 'CSV':
          ExportCsvService.export(question);
          break;
        case 'EXCEL':
          await ExportExcelService.export(surveyName, question);
          break;
        case 'PDF':
          await ExportPdfService.export(surveyName, question, cardRef);
          break;
        case 'PNG':
          await ExportImageService.export(question, cardRef);
          break;
      }
      
      toast.success(`Arquivo exportado com sucesso.`);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível exportar este conteúdo.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs px-2.5 gap-1.5" disabled={isExporting}>
          {isExporting ? <Loader2 className="h-2 w-2 animate-spin" /> : <Download className="h-2 w-2" />}
          <span className="hidden sm:inline">{isExporting ? "Exportando..." : "Exportar"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Exportar Pergunta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {!isTextQuestion && (
          <DropdownMenuItem onClick={() => handleExport('PNG')}>
            <FileImage className="mr-2 h-4 w-4 text-blue-500" />
            <span>Imagem (PNG)</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => handleExport('PDF')}>
          <FileText className="mr-2 h-4 w-4 text-red-500" />
          <span>Documento (PDF)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('EXCEL')}>
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
          <span>Planilha (.xlsx)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('CSV')}>
          <FileText className="mr-2 h-4 w-4 text-gray-600" />
          <span>Dados (CSV)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('JSON')}>
          <FileCode2 className="mr-2 h-4 w-4 text-yellow-600" />
          <span>Raw (JSON)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
