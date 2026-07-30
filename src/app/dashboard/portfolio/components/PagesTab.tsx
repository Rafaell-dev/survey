"use client";

import { useEffect, useState } from "react";
import { portfolioService, PortfolioPage } from "@/services/portfolio.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Plus, Loader2, FileText, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PagesTab() {
  const [pages, setPages] = useState<PortfolioPage[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [titlePt, setTitlePt] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [contentPt, setContentPt] = useState("");
  const [contentEn, setContentEn] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await portfolioService.getPages();
      setPages(data);
    } catch (error) {
      toast.error("Erro ao carregar páginas");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!slug || !titlePt || !titleEn) return toast.error("Slug e Títulos são obrigatórios");
    try {
      const payload = { slug, titlePt, titleEn, contentPt, contentEn };
      if (editingId) {
        const updated = await portfolioService.updatePage(editingId, payload);
        setPages(pages.map(p => p.id === editingId ? updated : p));
        toast.success("Página atualizada");
      } else {
        const created = await portfolioService.createPage(payload);
        setPages([...pages, created]);
        toast.success("Página criada");
      }
      resetForm();
    } catch { toast.error("Erro ao salvar página"); }
  };

  const handleEdit = (page: PortfolioPage) => {
    setEditingId(page.id);
    setSlug(page.slug);
    setTitlePt(page.titlePt);
    setTitleEn(page.titleEn);
    setContentPt(page.contentPt || "");
    setContentEn(page.contentEn || "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    try {
      await portfolioService.deletePage(id);
      setPages(pages.filter(i => i.id !== id));
      toast.success("Excluída com sucesso");
    } catch { toast.error("Erro ao excluir"); }
  };

  const resetForm = () => {
    setEditingId(null);
    setSlug(""); setTitlePt(""); setTitleEn(""); setContentPt(""); setContentEn("");
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b pb-2">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Páginas de Texto (Ensino, Pesquisa, etc)</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulario */}
        <div className="lg:col-span-2 space-y-4 border rounded-md p-4 bg-card shadow-sm">
          <h4 className="font-medium text-sm">{editingId ? "Editar Página" : "Nova Página"}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Slug (URL)</label>
              <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="ex: ensino" disabled={!!editingId} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Título (PT)</label>
              <Input value={titlePt} onChange={e => setTitlePt(e.target.value)} placeholder="Ex: Ensino" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Título (EN)</label>
              <Input value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Ex: Teaching" />
            </div>
          </div>
          
          <Tabs defaultValue="pt" className="w-full mt-4">
            <TabsList className="mb-2">
              <TabsTrigger value="pt">Conteúdo (PT)</TabsTrigger>
              <TabsTrigger value="en">Conteúdo (EN)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pt">
              <Textarea 
                value={contentPt} 
                onChange={e => setContentPt(e.target.value)} 
                placeholder="Escreva em português (Suporta Markdown básico na renderização pública se desejar implementá-lo depois)"
                className="min-h-[300px]"
              />
            </TabsContent>
            
            <TabsContent value="en">
              <Textarea 
                value={contentEn} 
                onChange={e => setContentEn(e.target.value)} 
                placeholder="Write in English..."
                className="min-h-[300px]"
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-2">
            {editingId && <Button variant="outline" onClick={resetForm}>Cancelar</Button>}
            <Button onClick={handleSave} className="gap-2">
              <Plus className="h-4 w-4"/> {editingId ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Páginas Cadastradas</h4>
          {pages.length === 0 && <span className="text-sm text-muted-foreground">Nenhuma página.</span>}
          {pages.map(page => (
            <Card key={page.id} className="bg-muted/30">
              <CardContent className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">{page.titlePt}</p>
                  <p className="text-xs text-muted-foreground">/p/[slug]/{page.slug}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(page)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
