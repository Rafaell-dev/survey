import { useState, useMemo, useEffect } from "react";
import { QuestionChartProps } from "../charts/types";
import { parseTextResponses } from "./utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function ResponseList({ question, visualization }: QuestionChartProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  const allResponses = useMemo(() => parseTextResponses(question.responses), [question.responses]);
  
  const filteredResponses = useMemo(() => {
    let result = allResponses;
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.text.toLowerCase().includes(lower) || 
        r.participant.toLowerCase().includes(lower)
      );
    }
    
    if (visualization.sortEnabled) {
      // Como é texto, a ordenação decrescente será da mais recente para a mais antiga (assumindo datas)
      // Se não houver variação de datas real, ordenaremos alfabeticamente para testar
      result = [...result].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) {
          return visualization.sortDirection === 'ASC' ? dateA - dateB : dateB - dateA;
        }
        return visualization.sortDirection === 'ASC' ? a.text.localeCompare(b.text) : b.text.localeCompare(a.text);
      });
    }
    
    return result;
  }, [allResponses, searchTerm, visualization.sortEnabled, visualization.sortDirection]);

  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const paginatedResponses = filteredResponses.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  if (allResponses.length === 0) {
    return (
      <div className="w-full py-12 text-center text-muted-foreground">
        Nenhuma resposta em texto fornecida para esta pergunta.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 p-2">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Pesquisar resposta..." 
          className="pl-8"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {paginatedResponses.map((r, i) => (
          <div key={r.id || i} className="p-4 rounded-lg bg-muted/40 border text-left">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-sm text-foreground">{r.participant}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(r.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">"{r.text}"</p>
          </div>
        ))}
        
        {filteredResponses.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhuma resposta encontrada para "{searchTerm}".
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages} ({filteredResponses.length} registros)
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
