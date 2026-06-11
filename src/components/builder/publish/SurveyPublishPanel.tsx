"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Send, Archive, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSurveyStore } from "@/store/survey.store";
import { SurveyStatusBadge } from "./SurveyStatusBadge";
import { PublicLinkCard } from "./PublicLinkCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SurveyPublishPanel() {
  const { 
    selectedSurvey, 
    publicLinkInfo, 
    publishing, 
    archiving, 
    publishSurvey, 
    archiveSurvey, 
    loadPublicLink, 
    generatePublicLink 
  } = useSurveyStore();

  const [loadingLink, setLoadingLink] = useState(false);

  useEffect(() => {
    if (selectedSurvey?.status === "PUBLISHED" && !publicLinkInfo) {
      setLoadingLink(true);
      loadPublicLink(selectedSurvey.id)
        .catch(() => {})
        .finally(() => setLoadingLink(false));
    }
  }, [selectedSurvey?.status, selectedSurvey?.id, publicLinkInfo, loadPublicLink]);

  if (!selectedSurvey) return null;

  const handlePublish = async () => {
    try {
      await publishSurvey(selectedSurvey.id);
      toast.success("Survey publicado com sucesso!");
      
      // Logo após publicar, tenta gerar ou carregar o link público
      try {
        await generatePublicLink(selectedSurvey.id);
      } catch (err) {
        // Se já existe, apenas carrega
        await loadPublicLink(selectedSurvey.id);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Erro ao publicar survey.";
      toast.error(message);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Deseja realmente arquivar este survey? Ele não aceitará mais respostas.")) return;
    try {
      await archiveSurvey(selectedSurvey.id);
      toast.success("Survey arquivado com sucesso!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao arquivar survey.");
    }
  };

  const handleGenerateLink = async () => {
    try {
      setLoadingLink(true);
      await generatePublicLink(selectedSurvey.id);
      toast.success("Link público gerado com sucesso!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao gerar link público.");
    } finally {
      setLoadingLink(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-lg font-medium">Publicação</h3>
          <p className="text-sm text-muted-foreground">Gerencie o status e o compartilhamento do seu survey.</p>
        </div>
        <SurveyStatusBadge status={selectedSurvey.status} />
      </div>

      {selectedSurvey.status === "DRAFT" && (
        <div className="space-y-4">
          <Alert>
            <Globe className="h-4 w-4" />
            <AlertTitle>Pronto para coletar respostas?</AlertTitle>
            <AlertDescription>
              Ao publicar o survey, ele passará a aceitar respostas. Certifique-se de ter adicionado blocos e perguntas.
            </AlertDescription>
          </Alert>
          <Button onClick={handlePublish} disabled={publishing} className="w-full">
            {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Publicar Survey
          </Button>
        </div>
      )}

      {selectedSurvey.status === "PUBLISHED" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Link de Compartilhamento</h4>
            {loadingLink ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando link...
              </div>
            ) : publicLinkInfo?.url ? (
              <PublicLinkCard url={publicLinkInfo.url} />
            ) : (
              <Button variant="outline" onClick={handleGenerateLink} className="w-full">
                Gerar Link Público
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-dashed">
            <h4 className="text-sm font-medium text-destructive mb-2">Zona de Perigo</h4>
            <Button 
              variant="destructive" 
              onClick={handleArchive} 
              disabled={archiving} 
              className="w-full"
            >
              {archiving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
              Arquivar Survey
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Surveys arquivados não podem receber novas respostas.
            </p>
          </div>
        </div>
      )}

      {selectedSurvey.status === "ARCHIVED" && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive">
          <Archive className="h-4 w-4" />
          <AlertTitle>Survey Arquivado</AlertTitle>
          <AlertDescription>
            Este survey foi arquivado e não está mais disponível para respostas públicas.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
