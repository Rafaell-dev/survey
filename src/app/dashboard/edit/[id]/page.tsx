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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useSurveyStore } from "@/store/survey.store";
import { useBuilderStore } from "@/store/builder.store";
import { BlockList } from "@/components/builder/BlockList";
import { SurveyPublishPanel } from "@/components/builder/publish/SurveyPublishPanel";
import { SurveyStatusBadge } from "@/components/builder/publish/SurveyStatusBadge";
import { ParticipantIdentificationType } from "@/domain/survey.types";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { ThemeEditor } from "@/components/builder/theme/ThemeEditor";

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;

  const { fetchSurvey, updateSurvey, updateSurveySettings } = useSurveyStore();
  const {
    fetchBlocks,
    saveAllBlocks,
    saving: savingBlocks,
    loading: loadingBlocks,
  } = useBuilderStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [status, setStatus] = useState("DRAFT");

  // Settings
  const [participantIdentificationType, setParticipantIdentificationType] =
    useState<ParticipantIdentificationType>("ANONYMOUS");
  const [allowMultipleResponses, setAllowMultipleResponses] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [savingSurvey, setSavingSurvey] = useState(false);

  const [activeTab, setActiveTab] = useState("editor");

  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 80 && currentScrollY > lastScrollY) {
        setIsScrollingDown(true);
      } else if (currentScrollY < lastScrollY) {
        setIsScrollingDown(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    Promise.all([fetchSurvey(surveyId), fetchBlocks(surveyId)])
      .then(([survey]) => {
        setTitle(survey.title);
        setDescription(survey.description || "");
        setInstructions(survey.instructions || "");
        setStatus(survey.status);
        setParticipantIdentificationType(survey.participantIdentificationType);
        setAllowMultipleResponses(survey.allowMultipleResponses);
        setInitialLoading(false);
      })
      .catch((err) => {
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
      // Salva Metadados e Settings paralelamente
      await Promise.all([
        updateSurvey(surveyId, {
          title,
          description: description || undefined,
          instructions: instructions || undefined,
        }),
        updateSurveySettings(surveyId, {
          participantIdentificationType,
          allowMultipleResponses,
        }),
      ]);

      // Salva Lote de Blocos
      await saveAllBlocks(surveyId);

      toast.success("Todas as alterações foram salvas com sucesso!");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Erro ao salvar as alterações.",
      );
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
        <span className="ml-3 text-muted-foreground">
          Carregando construtor...
        </span>
      </div>
    );
  }

  const isSaving = savingSurvey || savingBlocks;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Barra de Navegação: Oculta ao rolar para baixo e reaparece ao rolar para cima */}
      <div 
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between sticky top-0 z-30 bg-background/95 backdrop-blur-md pb-6 pt-6 border-b mb-6 gap-4 transition-transform duration-300 ${
          isScrollingDown ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/dashboard" className="shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold truncate">
              Construtor de Formulário
            </h1>
            <SurveyStatusBadge status={status as any} />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="gap-2 flex-1 sm:flex-none"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Compartilhar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md w-[95vw]">
              <SurveyPublishPanel />
            </DialogContent>
          </Dialog>

          {activeTab === "editor" && (
            <Button
              type="button"
              onClick={handleSave}
              className="gap-2 px-4 sm:px-8 flex-1 sm:flex-none"
              disabled={isSaving || !title.trim()}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? (
                "Salvando..."
              ) : (
                <span className="hidden sm:inline">Salvar Tudo</span>
              )}
              {!isSaving && <span className="sm:hidden">Salvar</span>}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Altura das Tabs aumentada para 24 (96px) que é 50% maior que 16 (64px) */}
        <TabsList className="mb-6 grid w-full grid-cols-3 h-24">
          <TabsTrigger value="editor" className="h-full">
            Editor
          </TabsTrigger>
          <TabsTrigger value="design" className="h-full">
            Personalizar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="h-full">
            Resultados
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="editor"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <form onSubmit={handleSave} className="space-y-12">
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
                    <label className="text-sm font-medium text-muted-foreground">
                      Descrição
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[100px] resize-y"
                      placeholder="Uma breve descrição sobre o objetivo desta pesquisa (Opcional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Instruções Iniciais
                    </label>
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

            {/* Seção 2: Configurações de Participação */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                <h2 className="text-lg font-semibold">
                  Configurações de Participação
                </h2>
              </div>

              <Card className="border-t-0 shadow-sm border-border/50">
                <CardContent className="pt-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Identificação do Participante
                      </label>
                      <Select
                        value={participantIdentificationType}
                        onValueChange={(val: ParticipantIdentificationType) =>
                          setParticipantIdentificationType(val)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ANONYMOUS">
                            Anônimo (Padrão)
                          </SelectItem>
                          <SelectItem value="EMAIL">
                            Exigir apenas E-mail
                          </SelectItem>
                          <SelectItem value="PHONE">
                            Exigir apenas Celular
                          </SelectItem>
                          <SelectItem value="EMAIL_OR_PHONE">
                            Exigir E-mail ou Celular
                          </SelectItem>
                          <SelectItem value="NAME_AND_EMAIL">
                            Exigir Nome e E-mail
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Determine quais dados serão exigidos antes da pesquisa
                        iniciar.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Respostas Múltiplas
                      </label>
                      <div className="flex items-center justify-between border rounded-md p-3">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">
                            Permitir múltiplas respostas
                          </label>
                          <p className="text-xs text-muted-foreground">
                            A mesma pessoa pode responder várias vezes?
                          </p>
                        </div>
                        <Switch
                          checked={allowMultipleResponses}
                          onCheckedChange={setAllowMultipleResponses}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Seção 3: Construtor de Blocos */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
                <h2 className="text-lg font-semibold">Blocos e Páginas</h2>
              </div>
              <BlockList />
            </section>
          </form>
        </TabsContent>

        <TabsContent
          value="design"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <ThemeEditor surveyId={surveyId} />
        </TabsContent>

        <TabsContent
          value="analytics"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <AnalyticsDashboard surveyId={surveyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
