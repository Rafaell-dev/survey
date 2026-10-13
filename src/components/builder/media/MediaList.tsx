"use client";

import { useEffect, useState } from "react";
import { useBuilderStore } from "@/store/builder.store";
import { MediaPreview } from "./MediaPreview";
import { Trash2, Loader2, FileWarning, ArrowUp, ArrowDown, Users, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Media } from "@/domain/media.types";

interface MediaListProps {
  questionId: string;
  isNew?: boolean;
}

interface MediaLimitInputProps {
  questionId: string;
  media: Media;
  index: number;
  totalMedias: number;
}

function MediaLimitInput({ questionId, media, index, totalMedias }: MediaLimitInputProps) {
  const { updateMediaLimit } = useBuilderStore();
  const [val, setVal] = useState<string>(media.responseLimit ? String(media.responseLimit) : "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setVal(media.responseLimit ? String(media.responseLimit) : "");
  }, [media.responseLimit]);

  const handleBlurOrSave = async () => {
    const trimmed = val.trim();
    if (trimmed === "") {
      if (media.responseLimit !== null && media.responseLimit !== undefined) {
        setIsSaving(true);
        try {
          await updateMediaLimit(questionId, media.id, null);
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 2000);
          toast.success(`Limite da Mídia ${String(index + 1).padStart(2, '0')} removido.`);
        } catch {
          toast.error("Erro ao remover limite.");
        } finally {
          setIsSaving(false);
        }
      }
      return;
    }

    const num = Number(trimmed);
    if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 9999) {
      toast.error("O limite deve ser um número inteiro de 1 até 9999.");
      setVal(media.responseLimit ? String(media.responseLimit) : "");
      return;
    }

    if (num === media.responseLimit) return;

    setIsSaving(true);
    try {
      await updateMediaLimit(questionId, media.id, num);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      toast.success(`Limite de ${num} respostas salvo para a Mídia ${String(index + 1).padStart(2, '0')}!`);
    } catch {
      toast.error("Erro ao salvar limite de respostas.");
    } finally {
      setIsSaving(false);
    }
  };

  const answersCount = media.answersCount ?? 0;
  const limit = media.responseLimit;
  const isLimitReached = limit !== null && limit !== undefined && answersCount >= limit;
  const progressPercent = limit ? Math.min(100, Math.round((answersCount / limit) * 100)) : 0;

  return (
    <div className="p-3 bg-muted/20 border-t space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground/90">
          <Users className="h-3.5 w-3.5 text-primary" />
          Limite de respostas (1 - 9999)
        </label>
        {isSaving ? (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Salvando...
          </span>
        ) : isSaved ? (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <Check className="h-3 w-3" /> Salvo!
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="number"
            min={1}
            max={9999}
            placeholder="Ex: 40 respostas"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={handleBlurOrSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            className="h-8 text-xs bg-background pr-16"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
            respostas
          </span>
        </div>
      </div>

      {limit ? (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              {answersCount} de {limit} respostas recebidas
            </span>
            <span className="font-semibold text-primary">{progressPercent}%</span>
          </div>

          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 rounded-full ${
                isLimitReached ? "bg-amber-500" : "bg-primary"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {isLimitReached ? (
            <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-0.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>Limite atingido! Passando para a próxima mídia configurada.</span>
            </div>
          ) : index < totalMedias - 1 ? (
            <p className="text-[10px] text-muted-foreground italic">
              Após atingir {limit} respostas, passa automaticamente para a Mídia {String(index + 2).padStart(2, '0')}.
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground italic">
              Última mídia da sequência.
            </p>
          )}
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground italic">
          Sem limite definido (receberá respostas sem rotação condicional).
        </p>
      )}
    </div>
  );
}

export function MediaList({ questionId, isNew }: MediaListProps) {
  const { mediaByQuestion, fetchQuestionMedia, removeMedia, reorderMedia } = useBuilderStore();
  const mediaList = mediaByQuestion[questionId] || [];
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew && !mediaByQuestion[questionId]) {
      setLoading(true);
      fetchQuestionMedia(questionId).finally(() => setLoading(false));
    }
  }, [isNew, questionId, mediaByQuestion, fetchQuestionMedia]);

  if (isNew) {
    return (
      <div className="p-4 border border-dashed rounded-lg bg-muted/10 flex items-center gap-3 text-muted-foreground">
        <FileWarning className="h-5 w-5 shrink-0" />
        <span className="text-sm">Salve o formulário primeiro para poder anexar arquivos de mídia e definir limites.</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-muted/5 rounded-lg border border-dashed">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando mídias anexadas...
      </div>
    );
  }

  if (mediaList.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mídias Configuradas ({mediaList.length}/4)
          </h4>
          {mediaList.length > 1 && (
            <Badge variant="outline" className="text-[10px] font-normal py-0">
              Rotação Condicional Ativa
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mediaList.map((media, index) => {
          const mediaNumberStr = String(index + 1).padStart(2, "0");
          return (
            <div 
              key={media.id} 
              className="group border rounded-xl overflow-hidden bg-card flex flex-col justify-between shadow-xs transition-shadow hover:shadow-md"
            >
              {/* Header com Tag da Mídia e Botões de Ordenação */}
              <div className="px-3 py-2 bg-muted/20 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground font-semibold text-xs">
                    Mídia {mediaNumberStr}
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground truncate max-w-[120px]" title={media.fileName}>
                    {media.fileName || media.type}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    disabled={index === 0}
                    onClick={() => reorderMedia(questionId, media.id, "up")}
                    title="Mover para cima na fila de respostas"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    disabled={index === mediaList.length - 1}
                    onClick={() => reorderMedia(questionId, media.id, "down")}
                    title="Mover para baixo na fila de respostas"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteConfirmId(media.id)}
                    title="Excluir mídia"
                  >
                    {deletingId === media.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Pré-visualização da Mídia */}
              <div className="p-2 flex-1 flex items-center justify-center bg-muted/5 min-h-[140px]">
                <MediaPreview media={media} />
              </div>

              {/* Campo para Definir Limite de Respostas (1 - 9999) */}
              <MediaLimitInput
                questionId={questionId}
                media={media}
                index={index}
                totalMedias={mediaList.length}
              />
            </div>
          );
        })}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-background w-full max-w-md rounded-xl p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-2">Excluir mídia?</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Esta ação irá excluir permanentemente esta mídia da questão e removerá qualquer limite de respostas configurado para ela.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={async () => {
                  const mediaId = deleteConfirmId;
                  setDeleteConfirmId(null);
                  setDeletingId(mediaId);
                  try {
                    await removeMedia(questionId, mediaId);
                    toast.success("Mídia excluída com sucesso.");
                  } catch {
                    toast.error("Erro ao excluir mídia.");
                  } finally {
                    setDeletingId(null);
                  }
                }} 
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" /> Sim, excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
