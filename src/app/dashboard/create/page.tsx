"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Form, Block } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BlockEditor } from "@/components/builder/BlockEditor";
import { ArrowLeft, Save, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/services/api";

export default function CreateFormPage() {
  const router = useRouter();
  const addForm = useStore((state) => state.addForm);
  
  const [title, setTitle] = useState("Formulário sem título");
  const [description, setDescription] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: crypto.randomUUID(),
      title: "Bloco 1",
      description: "",
      questions: [
        {
          id: crypto.randomUUID(),
          title: "Pergunta sem título",
          type: "multiple_choice",
          required: false,
          options: ["Opção 1"],
        }
      ],
    },
  ]);

  const handleAddBlock = () => {
    setBlocks([
      ...blocks,
      {
        id: crypto.randomUUID(),
        title: `Bloco ${blocks.length + 1}`,
        description: "",
        questions: [],
      },
    ]);
  };

  const handleUpdateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
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
      
      // Criar blocos vinculados ao survey
      for (const block of blocks) {
        const createdBlock = await fetchApi(`/blocks/survey/${data.id}`, {
          method: "POST",
          body: JSON.stringify({
            title: block.title,
            description: block.description
          })
        });

        // Criar perguntas vinculadas ao bloco
        for (const question of block.questions) {
          await fetchApi(`/questions/block/${createdBlock.id}`, {
            method: "POST",
            body: JSON.stringify({
              title: question.title,
              description: "", // A ser expandido no futuro
              type: question.type,
              required: question.required,
              options: question.options,
              scaleStart: question.scaleStart,
              scaleEnd: question.scaleEnd,
              scaleVisualType: question.scaleVisualType
            })
          });
        }
      }
      
      const newForm: Form = {
        id: data.id,
        title: data.title,
        description: data.description || "",
        blocks,
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
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        {blocks.map((b, index) => (
          <BlockEditor
            key={b.id}
            index={index}
            block={b}
            updateBlock={handleUpdateBlock}
            removeBlock={handleRemoveBlock}
          />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={handleAddBlock} variant="outline" className="gap-2 border-secondary/20 hover:bg-secondary/5 text-secondary">
          <LayoutTemplate className="h-5 w-5" />
          Adicionar Novo Bloco
        </Button>
      </div>
    </div>
  );
}
