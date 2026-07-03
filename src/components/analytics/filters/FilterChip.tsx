import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnalyticsFilter } from "@/domain/analytics.types";

interface FilterChipProps {
  filter: AnalyticsFilter;
  onRemove: () => void;
  getQuestionTitle?: (questionId: string) => string;
}

export function FilterChip({ filter, onRemove, getQuestionTitle }: FilterChipProps) {
  // Formatador legível para o operador
  const operatorMap: Record<string, string> = {
    EQUALS: "=",
    NOT_EQUALS: "≠",
    IN: "em",
    GREATER_THAN: ">",
    LESS_THAN: "<"
  };

  // Se for field = date ou participant
  let fieldName = filter.field;
  if (filter.field === 'date') fieldName = "Período";
  else if (filter.field === 'participant') fieldName = "Respondente";
  else if (getQuestionTitle) {
    // Tenta resolver o título da pergunta caso o field seja um questionId
    fieldName = getQuestionTitle(filter.field) || "Pergunta";
  }

  // Tenta extrair um valor legível
  let displayValue = String(filter.value);
  if (Array.isArray(filter.value)) {
    displayValue = filter.value.join(", ");
  } else if (typeof filter.value === 'object' && filter.value !== null) {
    displayValue = JSON.stringify(filter.value);
  }

  return (
    <Badge variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-0 font-normal">
      <span className="truncate max-w-[200px]" title={`${fieldName} ${operatorMap[filter.operator] || filter.operator} ${displayValue}`}>
        <span className="font-semibold">{fieldName}</span> {operatorMap[filter.operator] || filter.operator} {displayValue}
      </span>
      <button 
        onClick={onRemove}
        className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-primary/20 text-primary transition-colors"
        aria-label="Remover filtro"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
