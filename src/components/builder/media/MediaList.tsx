"use client";

import { useEffect, useState } from "react";
import { useBuilderStore } from "@/store/builder.store";
import { MediaPreview } from "./MediaPreview";
import { Trash2, Loader2, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaListProps {
  questionId: string;
  isNew?: boolean;
}

export function MediaList({ questionId, isNew }: MediaListProps) {
  const { mediaByQuestion, fetchQuestionMedia, removeMedia } = useBuilderStore();
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
        <span className="text-sm">Salve o formulário clicando em "Salvar Tudo" primeiro para poder anexar arquivos de mídia a esta nova pergunta.</span>
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
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Mídias Anexadas ({mediaList.length})
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mediaList.map((media) => (
          <div key={media.id} className="relative group border rounded-lg overflow-hidden bg-card flex flex-col justify-between">
            <div className="p-1 flex-1 flex items-center justify-center bg-muted/5">
              <MediaPreview media={media} />
            </div>
            
            <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
              <Button 
                variant="destructive" 
                size="icon" 
                className="h-8 w-8 shadow-lg bg-destructive/90 hover:bg-destructive text-white"
                onClick={() => setDeleteConfirmId(media.id)}
              >
                {deletingId === media.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
            <div className="px-3 py-2 border-t text-[11px] text-muted-foreground flex justify-between items-center bg-muted/10">
              <span className="truncate pr-2 font-medium" title={media.fileName}>
                {media.fileName || media.type}
              </span>
              <span className="shrink-0">{new Date(media.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-background w-full max-w-md rounded-xl p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-2">Tem certeza absoluta?</h3>
            <p className="text-muted-foreground mb-6">
              Esta ação irá excluir permanentemente esta mídia do seu formulário. Essa ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancelar</Button>
              <Button 
                variant="destructive" 
                onClick={async () => {
                  const mediaId = deleteConfirmId;
                  setDeleteConfirmId(null);
                  setDeletingId(mediaId);
                  await removeMedia(questionId, mediaId).catch(() => {});
                  setDeletingId(null);
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
