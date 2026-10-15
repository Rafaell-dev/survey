"use client";

import { useEffect, useState } from "react";
import { useBuilderStore } from "@/store/builder.store";
import { MediaPreview } from "./MediaPreview";
import { Trash2, Loader2, FileWarning, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface MediaListProps {
  questionId: string;
  isNew?: boolean;
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
        <span className="text-sm">Salve o formulário primeiro para poder anexar arquivos de mídia.</span>
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
            Mídias Anexadas ({mediaList.length}/4)
          </h4>
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
                    title="Mover para cima"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    disabled={index === mediaList.length - 1}
                    onClick={() => reorderMedia(questionId, media.id, "down")}
                    title="Mover para baixo"
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
            </div>
          );
        })}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-background w-full max-w-md rounded-xl p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-2">Excluir mídia?</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Esta ação irá excluir permanentemente esta mídia da questão.
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
