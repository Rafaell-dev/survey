"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Block } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BlockEditor } from "@/components/builder/BlockEditor";
import { ArrowLeft, Save, LayoutTemplate, Send, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/services/api";

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carrega os dados do survey
  useEffect(() => {
    fetchApi(`/surveys/${surveyId}`)
      .then((data) => {
        setTitle(data.title);
        setDescription(data.description || "");
        setStatus(data.status);
        // Mapeia os blocos do backend para o formato do frontend
        const mappedBlocks: Block[] = (data.blocks || []).map((b: any) => ({
          id: b.id,
          title: b.title || "",
          description: b.description || "",
          questions: (b.questions || []).map((q: any) => ({
            id: q.id,
            title: q.title,
            type: q.type.toLowerCase().replace("_", "_"),
            required: q.isRequired,
            options: (q.options || []).map((o: any) => o.label),
            scaleStart: q.scaleStart,
            scaleEnd: q.scaleEnd,
            scaleVisualType: q.scaleVisualType,
          })),
        }));
        setBlocks(mappedBlocks);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Erro ao carregar o formulário.");
        router.push("/dashboard");
      });
  }, [surveyId, router]);

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

  const handleSave = async (publish: boolean = false) => {
    setSaving(true);
    try {
      // Atualiza os dados básicos do survey
      await fetchApi(`/surveys/${surveyId}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          description,
          status: publish ? "PUBLISHED" : undefined,
        }),
      });

      if (publish) setStatus("PUBLISHED");
      alert("Formulário salvo com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar o formulário.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este formulário? Esta ação não pode ser desfeita.")) return;
    try {
      await fetchApi(`/surveys/${surveyId}`, { method: "DELETE" });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir o formulário.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 animate-in fade-in">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando formulário...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-4 pt-2 border-b">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Editar Formulário</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full ${status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-secondary text-secondary-foreground'}`}>
              {status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="icon" onClick={handleDelete} title="Excluir Formulário">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)} className="gap-2" disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar"}
          </Button>
          {status !== 'PUBLISHED' && (
            <Button onClick={() => handleSave(true)} className="gap-2 bg-green-600 hover:bg-green-700 text-white" disabled={saving}>
              <Send className="h-4 w-4" /> {saving ? "Publicando..." : "Publicar"}
            </Button>
          )}
        </div>
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
            allBlocks={blocks}
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
