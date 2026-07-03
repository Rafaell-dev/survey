import { useState, useMemo, useEffect } from "react";
import { QuestionChartProps } from "../charts/types";
import { parseTextResponses } from "./utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ResponseTable({ question, visualization }: QuestionChartProps) {
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
      result = [...result].sort((a, b) => {
        return visualization.sortDirection === 'ASC' 
          ? a.text.localeCompare(b.text) 
          : b.text.localeCompare(a.text);
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
    <div className="w-full flex flex-col gap-4">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Pesquisar na tabela..." 
          className="pl-8"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[150px]">Participante</TableHead>
              <TableHead>Resposta</TableHead>
              <TableHead className="w-[120px] text-right">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedResponses.length > 0 ? (
              paginatedResponses.map((r, i) => (
                <TableRow key={r.id || i}>
                  <TableCell className="font-medium">{r.participant}</TableCell>
                  <TableCell className="whitespace-pre-wrap">{r.text}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {new Date(r.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  Nenhuma resposta encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
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
