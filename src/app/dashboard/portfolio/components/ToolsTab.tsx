"use client";

import { useEffect, useState } from "react";
import { portfolioService, PortfolioTool, PortfolioToolCategory } from "@/services/portfolio.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Plus, Loader2, Wrench, Edit, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function ToolsTab() {
  const [tools, setTools] = useState<PortfolioTool[]>([]);
  const [categories, setCategories] = useState<PortfolioToolCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Categorias
  const [newCatPt, setNewCatPt] = useState("");
  const [newCatEn, setNewCatEn] = useState("");

  // Ferramentas
  const [newToolName, setNewToolName] = useState("");
  const [newToolDescPt, setNewToolDescPt] = useState("");
  const [newToolDescEn, setNewToolDescEn] = useState("");
  const [newToolUrl, setNewToolUrl] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ts, cs] = await Promise.all([
        portfolioService.getTools(),
        portfolioService.getToolCategories()
      ]);
      setTools(ts);
      setCategories(cs);
    } catch (error) {
      toast.error("Erro ao carregar");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatPt || !newCatEn) return toast.error("Preencha PT e EN");
    try {
      const created = await portfolioService.createToolCategory({ namePt: newCatPt, nameEn: newCatEn });
      setCategories([...categories, created]);
      setNewCatPt(""); setNewCatEn("");
      toast.success("Categoria adicionada");
    } catch { toast.error("Erro ao salvar"); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Excluir categoria? As ferramentas perderão este filtro.")) return;
    try {
      await portfolioService.deleteToolCategory(id);
      setCategories(categories.filter(i => i.id !== id));
      toast.success("Excluído");
    } catch { toast.error("Erro"); }
  };

  const handleAddTool = async () => {
    if (!newToolName || !newToolDescPt) return toast.error("Nome e descrição PT obrigatórios");
    try {
      const created = await portfolioService.createTool({
        name: newToolName,
        descriptionPt: newToolDescPt,
        descriptionEn: newToolDescEn || newToolDescPt,
        url: newToolUrl || null,
        categoryIds: selectedCats
      });
      setTools([...tools, created]);
      setNewToolName(""); setNewToolDescPt(""); setNewToolDescEn(""); setNewToolUrl(""); setSelectedCats([]);
      toast.success("Ferramenta salva");
    } catch { toast.error("Erro ao salvar"); }
  };

  const handleDeleteTool = async (id: string) => {
    if (!confirm("Excluir ferramenta?")) return;
    try {
      await portfolioService.deleteTool(id);
      setTools(tools.filter(i => i.id !== id));
      toast.success("Excluído");
    } catch { toast.error("Erro"); }
  };

  const toggleCat = (id: string) => {
    setSelectedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-10">
      
      {/* CATEGORIAS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Categorias de Filtro</h3>
        </div>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium">Nome (PT)</label>
            <Input value={newCatPt} onChange={e => setNewCatPt(e.target.value)} placeholder="Ex: Estatística" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium">Nome (EN)</label>
            <Input value={newCatEn} onChange={e => setNewCatEn(e.target.value)} placeholder="Ex: Statistics" />
          </div>
          <Button onClick={handleAddCategory}><Plus className="h-4 w-4"/> Adicionar</Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm">
              <span className="font-medium">{cat.namePt}</span>
              <button onClick={() => handleDeleteCategory(cat.id)} className="ml-1 text-destructive hover:bg-destructive/10 rounded-full p-0.5">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>


      {/* FERRAMENTAS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <Wrench className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Repositório de Ferramentas / Portfólio</h3>
        </div>
        
        <Card className="bg-muted/30">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Nome do Software/Ferramenta</label>
              <Input value={newToolName} onChange={e => setNewToolName(e.target.value)} placeholder="Ex: R Script Analyzer" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">URL (GitHub / Site Externo)</label>
              <Input value={newToolUrl} onChange={e => setNewToolUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Descrição (PT)</label>
              <Textarea value={newToolDescPt} onChange={e => setNewToolDescPt(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Descrição (EN)</label>
              <Textarea value={newToolDescEn} onChange={e => setNewToolDescEn(e.target.value)} />
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium">Selecionar Categorias</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => toggleCat(cat.id)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedCats.includes(cat.id) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
                  >
                    {cat.namePt}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button onClick={handleAddTool} className="gap-2"><Plus className="h-4 w-4"/> Adicionar Ferramenta</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {tools.length === 0 && <span className="text-sm text-muted-foreground col-span-full">Nenhuma ferramenta cadastrada.</span>}
          {tools.map(tool => (
            <Card key={tool.id}>
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{tool.name}</h4>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTool(tool.id)} className="text-destructive h-6 w-6">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground flex-1 mb-4">{tool.descriptionPt}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {tool.categories?.map(c => (
                    <span key={c.id} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full">{c.namePt}</span>
                  ))}
                </div>
                {tool.url && (
                  <a href={tool.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline border-t pt-2 block w-full text-center">
                    Acessar Link
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}
