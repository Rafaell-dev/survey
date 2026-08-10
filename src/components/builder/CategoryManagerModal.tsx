"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Check, X, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { surveyCategoryService, SurveyCategory } from "@/services/survey-category.service";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (categoryId: string) => void;
  onCategoriesUpdated?: () => void;
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  onSelectCategory,
  onCategoriesUpdated,
}: CategoryManagerModalProps) {
  const [categories, setCategories] = useState<SurveyCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await surveyCategoryService.list();
      setCategories(data);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
      toast.error("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setCreating(true);
      const created = await surveyCategoryService.create(newCategoryName.trim());
      setNewCategoryName("");
      toast.success(`Categoria "${created.name}" criada com sucesso!`);
      await loadCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
      if (onSelectCategory) {
        onSelectCategory(created.id);
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar categoria.");
    } finally {
      setCreating(false);
    }
  };

  const handleStartEdit = (cat: SurveyCategory) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      setUpdatingId(id);
      await surveyCategoryService.update(id, editingName.trim());
      toast.success("Categoria atualizada com sucesso!");
      setEditingId(null);
      await loadCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar categoria.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${name}"? Pesquisas associadas a ela ficarão sem categoria.`)) {
      return;
    }
    try {
      setDeletingId(id);
      await surveyCategoryService.delete(id);
      toast.success("Categoria excluída com sucesso!");
      await loadCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao excluir categoria.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Tag className="w-5 h-5 text-primary" />
            Gerenciar Categorias
          </DialogTitle>
          <DialogDescription>
            Crie, edite ou exclua categorias para organizar suas pesquisas.
          </DialogDescription>
        </DialogHeader>

        {/* Formulário de Criação rápida */}
        <form onSubmit={handleCreate} className="flex gap-2 my-2 items-center">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nova categoria (ex: Linguística, R...)"
            disabled={creating}
            className="flex-1 h-10"
          />
          <Button type="submit" disabled={creating || !newCategoryName.trim()} className="h-10 gap-1 px-4">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Criar
          </Button>
        </form>

        {/* Lista de Categorias */}
        <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex justify-center py-6 text-muted-foreground text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando categorias...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-md">
              Nenhuma categoria cadastrada ainda.
            </div>
          ) : (
            categories.map((cat) => {
              const isEditingThis = editingId === cat.id;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2.5 rounded-md bg-muted/40 hover:bg-muted/70 transition-colors border text-sm"
                >
                  {isEditingThis ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        className="h-8 text-sm"
                        disabled={updatingId === cat.id}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleSaveEdit(cat.id)}
                        disabled={updatingId === cat.id}
                      >
                        {updatingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={handleCancelEdit}
                        disabled={updatingId === cat.id}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-medium truncate">{cat.name}</span>
                        {cat._count?.surveys !== undefined && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                            {cat._count.surveys} {cat._count.surveys === 1 ? "pesquisa" : "pesquisas"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {onSelectCategory && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 text-xs px-2"
                            onClick={() => {
                              onSelectCategory(cat.id);
                              onClose();
                            }}
                          >
                            Selecionar
                          </Button>
                        )}

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleStartEdit(cat)}
                          title="Editar Categoria"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={deletingId === cat.id}
                          title="Excluir Categoria"
                        >
                          {deletingId === cat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
