"use client";

import { useState, useEffect } from "react";
import { LocalBlock } from "@/domain/block.types";
import { useBuilderStore } from "@/store/builder.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Users, 
  GitFork, 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  X,
  ArrowRight,
  Sparkles,
  EyeOff
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface BlockLimitConfigProps {
  block: LocalBlock;
  onUpdate: (id: string, updates: Partial<LocalBlock>) => void;
}

export function BlockLimitConfig({ block, onUpdate }: BlockLimitConfigProps) {
  const allBlocks = useBuilderStore((state) => state.blocks);
  const otherBlocks = allBlocks.filter((b) => b.id !== block.id);
  
  const hasLimit = block.responseLimit !== null && block.responseLimit !== undefined && block.responseLimit > 0;
  const isFallbackOnly = Boolean(block.showOnlyOnFallback);
  const [isOpen, setIsOpen] = useState(hasLimit || isFallbackOnly);
  const [limitVal, setLimitVal] = useState<string>(hasLimit ? String(block.responseLimit) : "");

  useEffect(() => {
    if (block.responseLimit) {
      setLimitVal(String(block.responseLimit));
    } else {
      setLimitVal("");
    }
  }, [block.responseLimit]);

  const handleLimitBlur = () => {
    const trimmed = limitVal.trim();
    if (trimmed === "") {
      if (hasLimit) {
        onUpdate(block.id, { responseLimit: null, fallbackBlockId: null });
        toast.info("Limite de respostas do bloco removido.");
      }
      return;
    }

    const num = Number(trimmed);
    if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 9999) {
      toast.error("O limite deve ser um número inteiro entre 1 e 9999.");
      setLimitVal(hasLimit ? String(block.responseLimit) : "");
      return;
    }

    if (num !== block.responseLimit) {
      // Se definiu limite e ainda não tem fallback definido, sugere o próximo bloco se houver
      const updates: Partial<LocalBlock> = { responseLimit: num };
      if (!block.fallbackBlockId && otherBlocks.length > 0) {
        const nextBlock = otherBlocks.find(b => b.orderIndex > block.orderIndex) || otherBlocks[0];
        if (nextBlock) {
          updates.fallbackBlockId = nextBlock.id;
        }
      }
      onUpdate(block.id, updates);
      toast.success(`Limite configurado para ${num} respostas.`);
    }
  };

  const handleClearLimit = () => {
    setLimitVal("");
    onUpdate(block.id, { responseLimit: null, fallbackBlockId: null });
    setIsOpen(false);
    toast.info("Limite de respostas do bloco removido.");
  };

  const responsesCount = block.responsesCount ?? 0;
  const limit = block.responseLimit;
  const isLimitReached = limit !== null && limit !== undefined && responsesCount >= limit;
  const progressPercent = limit ? Math.min(100, Math.round((responsesCount / limit) * 100)) : 0;

  const targetFallbackBlock = block.fallbackBlockId 
    ? allBlocks.find(b => b.id === block.fallbackBlockId)
    : null;

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden bg-card/60 transition-all shadow-2xs">
      {/* Barra de cabeçalho do controle de limite */}
      <div 
        className="px-3.5 py-2.5 bg-muted/20 hover:bg-muted/30 cursor-pointer flex items-center justify-between gap-3 select-none transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>Limite de Respostas do Bloco</span>
          </div>

          {hasLimit ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge 
                variant="outline" 
                className={`text-[11px] font-medium py-0 px-2 ${
                  isLimitReached 
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                    : "border-primary/40 bg-primary/10 text-primary"
                }`}
              >
                {isLimitReached ? "Limite Atingido" : `${responsesCount}/${limit} respostas`}
              </Badge>

              {targetFallbackBlock && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ArrowRight className="h-3 w-3 text-muted-foreground/70" />
                  <span className="font-medium text-foreground truncate max-w-[140px]">
                    Bloco {targetFallbackBlock.orderIndex + 1}: {targetFallbackBlock.title || "Sem título"}
                  </span>
                </span>
              )}
            </div>
          ) : null}

          {isFallbackOnly && (
            <Badge 
              variant="outline" 
              className="border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-medium py-0 px-2 flex items-center gap-1"
            >
              <EyeOff className="h-3 w-3" />
              <span>Apenas via limite</span>
            </Badge>
          )}

          {!hasLimit && !isFallbackOnly && (
            <span className="text-[11px] text-muted-foreground italic">
              (Sem limite condicional)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {hasLimit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleClearLimit();
              }}
              title="Remover limite de respostas"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Conteúdo Expansível de Configuração */}
      {isOpen && (
        <div className="p-3.5 pt-3 border-t border-border/40 space-y-3 bg-muted/10 animate-in fade-in slide-in-from-top-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Campo 1: Limite numérico */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>Capacidade Máxima (1 a 9999)</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min={1}
                  max={9999}
                  placeholder="Ex: 50"
                  value={limitVal}
                  onChange={(e) => setLimitVal(e.target.value)}
                  onBlur={handleLimitBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  className="h-8 text-xs bg-background pr-16 font-medium"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
                  respostas
                </span>
              </div>
            </div>

            {/* Campo 2: Bloco de Redirecionamento (Fallback) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <GitFork className="h-3.5 w-3.5 text-primary" />
                <span>Ao atingir o limite, redirecionar para</span>
              </label>

              {otherBlocks.length > 0 ? (
                <Select
                  value={block.fallbackBlockId || "none"}
                  onValueChange={(val) => {
                    onUpdate(block.id, { fallbackBlockId: val === "none" ? null : val });
                  }}
                  disabled={!hasLimit && !limitVal}
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="Selecione o bloco de destino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum (finalizar ou próximo padrão)</SelectItem>
                    {otherBlocks.map((ob) => (
                      <SelectItem key={ob.id} value={ob.id}>
                        Bloco {ob.orderIndex + 1}: {ob.title || "Sem título"}
                        {ob.showOnlyOnFallback ? " (Exclusivo de redirecionamento)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-[11px] text-muted-foreground italic bg-muted/30 p-2 rounded-md border border-dashed">
                  Adicione outro bloco para poder configurar o redirecionamento.
                </div>
              )}
            </div>
          </div>

          {/* Métricas e Status de Rotação */}
          {hasLimit && (
            <div className="pt-1.5 space-y-2 border-t border-border/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  <strong>{responsesCount}</strong> de <strong>{limit}</strong> respostas recebidas neste bloco
                </span>
                <span className="font-semibold text-primary">{progressPercent}%</span>
              </div>

              {/* Barra de Progresso */}
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    isLimitReached ? "bg-amber-500" : "bg-primary"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Avisos Contextuais */}
              {isLimitReached ? (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Limite atingido! Todos os próximos respondentes serão redirecionados para{" "}
                    <strong>{targetFallbackBlock ? `Bloco ${targetFallbackBlock.orderIndex + 1}: ${targetFallbackBlock.title || 'Sem título'}` : 'o próximo bloco configurado'}</strong>.
                  </span>
                </div>
              ) : targetFallbackBlock ? (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>
                    Assim que este bloco atingir <strong>{limit} respostas</strong>, novos respondentes serão automaticamente enviados para o{" "}
                    <strong className="text-foreground">Bloco {targetFallbackBlock.orderIndex + 1} ({targetFallbackBlock.title || 'Sem título'})</strong>.
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  ⚠️ Defina um bloco de destino para onde os respondentes devem ser enviados quando o limite for atingido.
                </p>
              )}
            </div>
          )}

          {/* Opção para exibir apenas se redirecionado de um limite de respostas */}
          <div className="pt-2.5 border-t border-border/40">
            <label
              htmlFor={`show-only-fallback-${block.id}`}
              className="flex items-start gap-3 p-2.5 rounded-lg border border-border/60 bg-background/50 hover:bg-background/80 cursor-pointer transition-colors"
            >
              <Checkbox
                id={`show-only-fallback-${block.id}`}
                checked={Boolean(block.showOnlyOnFallback)}
                onCheckedChange={(checked) => {
                  const isChecked = Boolean(checked);
                  onUpdate(block.id, { showOnlyOnFallback: isChecked });
                  if (isChecked) {
                    toast.success("Bloco configurado para aparecer apenas quando redirecionado por limite.");
                  } else {
                    toast.info("Bloco restaurado para o fluxo sequencial padrão.");
                  }
                }}
                className="mt-0.5"
              />
              <div className="space-y-0.5 select-none">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <EyeOff className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Apenas exibir se direcionado de um limite de respostas</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Quando marcado, este bloco é ignorado na navegação linear normal e só será exibido se o respondente for encaminhado para cá por um limite atingido de outro bloco.
                </p>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
