import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AnalyticsFilter, QuestionAnalyticsDTO } from "@/domain/analytics.types";
import { Filter, Plus } from "lucide-react";

interface FilterBuilderProps {
  questions: QuestionAnalyticsDTO[];
  onAddFilter: (filter: AnalyticsFilter) => void;
}

export function FilterBuilder({ questions, onAddFilter }: FilterBuilderProps) {
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [operator, setOperator] = useState<AnalyticsFilter["operator"]>("EQUALS");
  const [value, setValue] = useState("");

  // Apenas perguntas de múltipla/única escolha são bons candidatos de demonstração simples para filtros
  const filterableQuestions = questions.filter(
    q => q.type === "MULTIPLE_CHOICE" || q.type === "SINGLE_CHOICE" || q.type === "LIKERT"
  );

  const selectedQuestion = filterableQuestions.find(q => q.questionId === filterType);

  const handleApply = () => {
    if (!filterType || !value) return;

    onAddFilter({
      field: filterType,
      operator,
      value
    });

    // Reset and close
    setFilterType("");
    setOperator("EQUALS");
    setValue("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed flex items-center gap-2 text-muted-foreground">
          <Plus className="h-3.5 w-3.5" />
          <span>Adicionar Filtro</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4" align="start">
        <div className="flex flex-col gap-4">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Novo Filtro
          </h4>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Campo (Pergunta / Variável)</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data (Período)</SelectItem>
                <SelectItem value="participant">Respondente</SelectItem>
                {filterableQuestions.length > 0 && (
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Respostas do Formulário
                  </div>
                )}
                {filterableQuestions.map(q => (
                  <SelectItem key={q.questionId} value={q.questionId}>
                    {q.questionTitle || q.blockTitle || "Pergunta sem título"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Condição</label>
            <Select value={operator} onValueChange={(v: any) => setOperator(v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterType === 'date' ? (
                  <SelectItem value="EQUALS">Período Selecionado</SelectItem>
                ) : (
                  <>
                    <SelectItem value="EQUALS">Igual a (=)</SelectItem>
                    <SelectItem value="NOT_EQUALS">Diferente de (≠)</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Valor</label>
            
            {filterType === 'date' ? (
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoje">Hoje</SelectItem>
                  <SelectItem value="Últimos 7 dias">Últimos 7 dias</SelectItem>
                  <SelectItem value="Últimos 30 dias">Últimos 30 dias</SelectItem>
                  <SelectItem value="Personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            ) : filterType === 'participant' ? (
              <Input 
                placeholder="E-mail ou ID do respondente..." 
                className="h-9" 
                value={value}
                onChange={e => setValue(e.target.value)}
              />
            ) : selectedQuestion && selectedQuestion.options ? (
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione uma resposta" />
                </SelectTrigger>
                <SelectContent>
                  {selectedQuestion.options.map(opt => (
                    <SelectItem key={opt.optionId} value={opt.label}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input 
                placeholder="Digite o valor..." 
                className="h-9" 
                value={value}
                onChange={e => setValue(e.target.value)}
              />
            )}
          </div>

          <Button onClick={handleApply} disabled={!filterType || !value} className="w-full mt-2">
            Aplicar Filtro
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
