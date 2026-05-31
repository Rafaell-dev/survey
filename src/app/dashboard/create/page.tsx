"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Form, Question } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionEditor } from "@/components/builder/QuestionEditor";
import { ArrowLeft, Save, PlusCircle } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/services/api";

export default function CreateFormPage() {
  const router = useRouter();
  const addForm = useStore((state) => state.addForm);
  
  const [title, setTitle] = useState("Formulário sem título");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: crypto.randomUUID(),
      title: "Pergunta sem título",
      type: "multiple_choice",
      required: false,
      options: ["Opção 1"],
    },
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        title: "",
        type: "multiple_choice",
        required: false,
        options: ["Opção 1"],
      },
    ]);
  };

  const handleUpdateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = await fetchApi("/surveys", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
        }),
      });
      // Em um cenário real, também salvaríamos as perguntas (blocos/opções) aqui ou numa rota aninhada
      // Mas para a Tarefa 2.1 e 2.2, focamos no Survey principal primeiro.
      
      const newForm: Form = {
        id: data.id,
        title: data.title,
        description: data.description || "",
        questions,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
      
      addForm(newForm);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar o formulário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-4 pt-2 border-b">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Criar Formulário</h1>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={loading}>
          <Save className="h-4 w-4" /> {loading ? "Salvando..." : "Salvar Formulário"}
        </Button>
      </div>

      <Card className="border-t-8 border-t-primary shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-4xl font-bold h-auto px-0 border-transparent focus-visible:ring-0 focus-visible:border-b-primary rounded-none shadow-none text-foreground bg-transparent"
            placeholder="Título do Formulário"
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-muted-foreground border-transparent focus-visible:ring-0 focus-visible:border-b-primary rounded-none shadow-none px-0 bg-transparent"
            placeholder="Descrição do Formulário"
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <QuestionEditor
            key={q.id}
            index={index}
            question={q}
            updateQuestion={handleUpdateQuestion}
            removeQuestion={handleRemoveQuestion}
          />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={handleAddQuestion} variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
          <PlusCircle className="h-5 w-5 text-primary" />
          Adicionar Pergunta
        </Button>
      </div>
    </div>
  );
}
