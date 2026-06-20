"use client";

import { useAnalyticsStore } from "@/store/analytics.store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function ReportFilters({ filters, onChange }: { filters: any, onChange: (f: any) => void }) {
  const { questions, navigation } = useAnalyticsStore();
  const allQuestions = questions?.questions || [];
  const allBlocks = navigation?.blocks || [];

  const handleToggleQuestion = (questionId: string) => {
    const selected = filters.selectedQuestions || [];
    if (selected.includes(questionId)) {
      onChange({ ...filters, selectedQuestions: selected.filter((id: string) => id !== questionId) });
    } else {
      onChange({ ...filters, selectedQuestions: [...selected, questionId] });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Métricas Gerais</CardTitle>
            <CardDescription>Configurações de visualização do cabeçalho.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-metrics" className="cursor-pointer">
                Exibir Cards de Métricas
              </Label>
              <Switch 
                id="show-metrics" 
                checked={filters.showMetrics}
                onCheckedChange={(c) => onChange({ ...filters, showMetrics: c })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Status das Respostas</Label>
              <Select 
                value={filters.status} 
                onValueChange={(val) => onChange({ ...filters, status: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas (Iniciadas e Concluídas)</SelectItem>
                  <SelectItem value="COMPLETED">Apenas Concluídas</SelectItem>
                  <SelectItem value="IN_PROGRESS">Apenas em Andamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <input 
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters.dateRange?.from || ''}
                  onChange={(e) => onChange({ ...filters, dateRange: { ...filters.dateRange, from: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <input 
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters.dateRange?.to || ''}
                  onChange={(e) => onChange({ ...filters, dateRange: { ...filters.dateRange, to: e.target.value } })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>ID do Participante (Opcional)</Label>
              <input 
                type="text"
                placeholder="Filtrar por participante..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={filters.participantIds?.[0] || ''}
                onChange={(e) => onChange({ ...filters, participantIds: e.target.value ? [e.target.value] : [] })}
              />
            </div>
            
            {allBlocks.length > 0 && (
              <div className="space-y-2">
                <Label>Bloco Específico</Label>
                <Select 
                  value={filters.blockIds?.[0] || "ALL"} 
                  onValueChange={(val) => onChange({ ...filters, blockIds: val === "ALL" ? [] : [val] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os blocos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos os blocos</SelectItem>
                    {allBlocks.map(b => (
                      <SelectItem key={b.blockId} value={b.blockId}>
                        {b.title || `Bloco ${b.blockId.substring(0, 8)}...`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Perguntas Incluídas</CardTitle>
            <CardDescription>Selecione quais perguntas farão parte deste relatório.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {allQuestions.map(q => (
                <div key={q.questionId} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-md">
                  <Checkbox 
                    id={`q-${q.questionId}`}
                    checked={(filters.selectedQuestions || []).includes(q.questionId)}
                    onCheckedChange={() => handleToggleQuestion(q.questionId)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={`q-${q.questionId}`} className="font-medium cursor-pointer">
                      {q.questionTitle || `Pergunta ${q.questionId.substring(0, 8)}...`}
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      {q.blockTitle && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                          {q.blockTitle}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {q.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {allQuestions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma pergunta respondida ainda.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
