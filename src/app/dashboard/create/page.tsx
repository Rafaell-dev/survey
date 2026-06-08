"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

import { useSurveyStore } from "@/store/survey.store";

export default function CreateFormPage() {
  const router = useRouter();
  const { createSurvey, loading } = useSurveyStore();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("O título é obrigatório.");
      return;
    }

    try {
      const survey = await createSurvey({
        title,
        description: description || undefined,
        instructions: instructions || undefined,
      });
      
      toast.success("Survey criado com sucesso.");
      router.push(`/dashboard/edit/${survey.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar survey.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSave}>
        <div className="flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-4 pt-2 border-b mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Criar Survey</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading || !title.trim()}>
              <Send className="h-4 w-4" /> {loading ? "Criando..." : "Salvar e Continuar"}
            </Button>
          </div>
        </div>

        <Card className="border-t-8 border-t-primary shadow-sm">
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
              <label className="text-sm font-medium text-muted-foreground">Instruções para o Participante</label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="min-h-[100px] resize-y"
                placeholder="Ex: Leia atentamente cada questão antes de responder... (Opcional)"
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
