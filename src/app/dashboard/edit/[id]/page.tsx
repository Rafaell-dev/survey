"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Share2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { useSurveyStore } from "@/store/survey.store";
import { useBuilderStore } from "@/store/builder.store";
import { BlockList } from "@/components/builder/BlockList";
import { SurveyPublishPanel } from "@/components/builder/publish/SurveyPublishPanel";
import { SurveyStatusBadge } from "@/components/builder/publish/SurveyStatusBadge";

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;

  const { fetchSurvey, updateSurvey } = useSurveyStore();
  const { fetchBlocks, saveAllBlocks, saving: savingBlocks, loading: loadingBlocks } = useBuilderStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [status, setStatus] = useState("DRAFT");
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [savingSurvey, setSavingSurvey] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchSurvey(surveyId),
      fetchBlocks(surveyId)
    ]).then(([survey]) => {
      setTitle(survey.title);
      setDescription(survey.description || "");
      setInstructions(survey.instructions || "");
      setStatus(survey.status);
      setInitialLoading(false);
    }).catch((err) => {
      toast.error("Erro ao carregar os dados.");
      router.push("/dashboard");
    });
  }, [surveyId, fetchSurvey, fetchBlocks, router]);

  const saveForm = async () => {
    if (!title.trim()) {
      toast.error("O título do formulário é obrigatório.");
      throw new Error("O título é obrigatório");
    }

    setSavingSurvey(true);
    try {
      // Salva Metadados do Survey
      await updateSurvey(surveyId, {
        title,
        description: description || undefined,
        instructions: instructions || undefined,
      });

      // Salva Lote de Blocos (Criações, Edições, Deleções, Reordenações)
      await saveAllBlocks(surveyId);
      
      toast.success("Todas as alterações foram salvas com sucesso!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro ao salvar as alterações.");
      throw err;
    } finally {
      setSavingSurvey(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveForm();
    } catch (e) {
      // Já tratado dentro do saveForm
    }
  };

  if (initialLoading || loadingBlocks) {
    return (
      <div className="flex items-center justify-center h-96 animate-in fade-in">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando construtor...</span>
      </div>
    );
  }

  const isSaving = savingSurvey || savingBlocks;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSave}>
        <div className="flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-4 pt-2 border-b mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Construtor de Formulário</h1>
              <SurveyStatusBadge status={status as any} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <SurveyPublishPanel />
              </DialogContent>
            </Dialog>

            <Button type="submit" className="gap-2 px-8" disabled={isSaving || !title.trim()}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Salvando..." : "Salvar Tudo"}
            </Button>
          </div>
        </div>
<<<<<<< Updated upstream
=======
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="gap-2 flex-1 sm:flex-none">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Compartilhar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md w-[95vw]">
              <SurveyPublishPanel onBeforePublish={saveForm} />
            </DialogContent>
          </Dialog>
>>>>>>> Stashed changes

        <div className="space-y-12">
          {/* Seção 1: Configurações Básicas do Survey */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-1 bg-primary rounded-full"></div>
              <h2 className="text-lg font-semibold">Informações Gerais</h2>
            </div>
            
            <Card className="border-t-0 shadow-sm border-border/50">
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-3xl font-bold h-auto px-0 border-transparent focus-visible:ring-0 focus-visible:border-b-primary rounded-none shadow-none text-foreground bg-transparent"
                    placeholder="Título do Formulário *"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px] resize-y"
                    placeholder="Uma breve descrição sobre o objetivo desta pesquisa (Opcional)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Instruções Iniciais</label>
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="min-h-[100px] resize-y"
                    placeholder="Ex: Leia atentamente cada questão antes de responder... (Opcional)"
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Seção 2: Construtor de Blocos */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
              <h2 className="text-lg font-semibold">Blocos e Páginas</h2>
            </div>
            <BlockList />
          </section>
        </div>

      </form>
    </div>
  );
}
