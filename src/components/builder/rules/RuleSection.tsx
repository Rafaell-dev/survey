"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Pencil, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBuilderStore } from "@/store/builder.store";
import { RuleOperator, CreateConditionalRuleDTO, UpdateConditionalRuleDTO } from "@/domain/conditional-rule.types";

const OPERATOR_LABELS: Record<RuleOperator, string> = {
  EQUALS: "Igual a",
  NOT_EQUALS: "Diferente de",
  GREATER_THAN: "Maior que",
  LESS_THAN: "Menor que",
};

interface RuleSectionProps {
  questionId: string;
  blockId: string;
  isNew?: boolean;
}

export function RuleSection({ questionId, blockId, isNew }: RuleSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { 
    blocks, 
    rulesByQuestion, 
    fetchQuestionRules, 
    createRule, 
    updateRule, 
    deleteRule 
  } = useBuilderStore();

  const rules = rulesByQuestion[questionId] || [];
  const availableBlocks = blocks.filter(b => b.id !== blockId);

  useEffect(() => {
    if (isOpen && !isNew) {
      setIsLoading(true);
      fetchQuestionRules(questionId)
        .catch(() => toast.error("Erro ao carregar regras."))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, questionId, isNew, fetchQuestionRules]);

  const handleCreate = async (dto: CreateConditionalRuleDTO) => {
    try {
      await createRule(questionId, dto);
      toast.success("Regra criada com sucesso.");
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar regra.");
    }
  };

  const handleUpdate = async (ruleId: string, dto: UpdateConditionalRuleDTO) => {
    try {
      await updateRule(questionId, ruleId, dto);
      toast.success("Regra atualizada com sucesso.");
      setEditingRuleId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar regra.");
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm("Deseja realmente excluir esta regra condicional?")) return;
    try {
      await deleteRule(questionId, ruleId);
      toast.success("Regra removida com sucesso.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao remover regra.");
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-dashed">
      <Button
        variant="ghost"
        size="sm"
        className={`gap-2 text-xs ${isOpen ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <GitBranch className="h-3.5 w-3.5" />
        Regras Condicionais
        {rules.length > 0 && (
          <span className="ml-1 bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {rules.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2">
          {isNew ? (
            <p className="text-xs text-muted-foreground italic bg-muted/50 p-3 rounded-md">
              Salve o formulário antes de adicionar regras condicionais.
            </p>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Rule List */}
              {rules.length === 0 && !showForm && (
                <p className="text-xs text-muted-foreground italic">
                  Nenhuma regra definida.
                </p>
              )}

              {rules.map((rule) => (
                <div key={rule.id} className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 border rounded-md text-sm">
                  {editingRuleId === rule.id ? (
                    <RuleForm
                      availableBlocks={availableBlocks}
                      initialValues={{
                        operator: rule.operator,
                        matchValue: rule.matchValue,
                        targetBlockId: rule.targetBlockId,
                      }}
                      onSubmit={(dto) => handleUpdate(rule.id, dto)}
                      onCancel={() => setEditingRuleId(null)}
                      submitLabel="Salvar"
                    />
                  ) : (
                    <>
                      <span className="text-muted-foreground font-medium">Se resposta</span>
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold">
                        {OPERATOR_LABELS[rule.operator]}
                      </span>
                      <span className="font-mono bg-background border px-2 py-0.5 rounded text-xs">
                        {rule.matchValue}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="bg-secondary/50 px-2 py-0.5 rounded text-xs font-medium">
                        {rule.targetBlock?.title || "Bloco sem título"}
                      </span>
                      <div className="ml-auto flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-primary"
                          onClick={() => setEditingRuleId(rule.id)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(rule.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Create Form */}
              {showForm ? (
                <div className="p-3 border border-dashed border-primary/30 rounded-md bg-primary/5">
                  <RuleForm
                    availableBlocks={availableBlocks}
                    onSubmit={handleCreate}
                    onCancel={() => setShowForm(false)}
                    submitLabel="Criar Regra"
                  />
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed text-muted-foreground hover:text-foreground"
                  onClick={() => setShowForm(true)}
                  disabled={availableBlocks.length === 0}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Adicionar Regra
                </Button>
              )}

              {availableBlocks.length === 0 && (
                <p className="text-xs text-amber-600 italic">
                  Adicione mais blocos ao survey para criar regras de navegação.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Inline RuleForm ────────────────────────────────────────

interface RuleFormProps {
  availableBlocks: { id: string; title: string; orderIndex: number }[];
  initialValues?: {
    operator: RuleOperator;
    matchValue: string;
    targetBlockId: string;
  };
  onSubmit: (dto: CreateConditionalRuleDTO) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

function RuleForm({ availableBlocks, initialValues, onSubmit, onCancel, submitLabel }: RuleFormProps) {
  const [operator, setOperator] = useState<RuleOperator>(initialValues?.operator || "EQUALS");
  const [matchValue, setMatchValue] = useState(initialValues?.matchValue || "");
  const [targetBlockId, setTargetBlockId] = useState(initialValues?.targetBlockId || availableBlocks[0]?.id || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!matchValue.trim() || !targetBlockId) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ operator, matchValue: matchValue.trim(), targetBlockId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 w-full">
      <span className="text-xs text-muted-foreground font-medium shrink-0">Se resposta</span>
      <select
        value={operator}
        onChange={(e) => setOperator(e.target.value as RuleOperator)}
        className="h-7 text-xs rounded border border-input bg-background px-2 focus:ring-1 focus:ring-primary outline-none"
      >
        {Object.entries(OPERATOR_LABELS).map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
      <Input
        value={matchValue}
        onChange={(e) => setMatchValue(e.target.value)}
        placeholder="Valor"
        className="h-7 w-24 text-xs"
      />
      <span className="text-xs text-muted-foreground shrink-0">pular para</span>
      <select
        value={targetBlockId}
        onChange={(e) => setTargetBlockId(e.target.value)}
        className="h-7 text-xs rounded border border-input bg-background px-2 flex-1 min-w-[120px] focus:ring-1 focus:ring-primary outline-none"
      >
        {availableBlocks.map(b => (
          <option key={b.id} value={b.id}>{b.title || `Bloco ${b.orderIndex + 1}`}</option>
        ))}
      </select>
      <div className="flex gap-1 ml-auto">
        <Button size="sm" className="h-7 text-xs" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : submitLabel}
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
