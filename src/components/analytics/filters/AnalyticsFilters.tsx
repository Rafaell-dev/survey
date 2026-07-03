import { useAnalyticsStore } from "@/store/analytics.store";
import { AnalyticsFilter } from "@/domain/analytics.types";
import { FilterChip } from "./FilterChip";
import { FilterBuilder } from "./FilterBuilder";
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";

export function AnalyticsFilters({ surveyId }: { surveyId: string }) {
  const { questions, activeFilters, setFilters } = useAnalyticsStore();

  const handleAddFilter = (filter: AnalyticsFilter) => {
    // Evita filtros duplicados exatos
    const exists = activeFilters.some(
      f => f.field === filter.field && f.operator === filter.operator && f.value === filter.value
    );
    
    if (!exists) {
      setFilters(surveyId, [...activeFilters, filter]);
    }
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = [...activeFilters];
    newFilters.splice(index, 1);
    setFilters(surveyId, newFilters);
  };

  const handleClearAll = () => {
    setFilters(surveyId, []);
  };

  // Helper para nomear a pergunta no Chip
  const getQuestionTitle = (id: string) => {
    if (!questions) return "";
    const q = questions.questions.find(q => q.questionId === id);
    return q?.questionTitle || q?.blockTitle || "";
  };

  return (
    <div className="w-full bg-background border rounded-lg p-3 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 transition-all">
      <div className="flex-1 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-foreground mr-2 flex items-center gap-2">
          Filtros:
        </span>
        
        {activeFilters.length === 0 && (
          <span className="text-sm text-muted-foreground italic mr-2">
            Nenhum filtro aplicado. Exibindo todos os dados.
          </span>
        )}

        {activeFilters.map((filter, idx) => (
          <FilterChip 
            key={`${filter.field}-${idx}`}
            filter={filter}
            onRemove={() => handleRemoveFilter(idx)}
            getQuestionTitle={getQuestionTitle}
          />
        ))}

        <div className="ml-1">
          <FilterBuilder 
            questions={questions?.questions || []} 
            onAddFilter={handleAddFilter} 
          />
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleClearAll}
          >
            <FilterX className="h-4 w-4 mr-2" />
            Limpar tudo
          </Button>
        </div>
      )}
    </div>
  );
}
