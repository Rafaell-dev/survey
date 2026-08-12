"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft, ArrowRight, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditableField } from "./EditableField";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { cn } from "@/lib/utils";

export interface PublicationSection {
  id: string;
  title: string;
  content: string;
}

export interface PublicationsData {
  introText?: string;
  sections: PublicationSection[];
}

interface PublicationsTabProps {
  data: PublicationsData;
  isEditing: boolean;
  onUpdate: (data: PublicationsData) => void;
}

export function PublicationsTab({ data, isEditing, onUpdate }: PublicationsTabProps) {
  const sections = data?.sections || [];
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (sections.length > 0) {
      if (!activeSectionId || !sections.some((s) => s.id === activeSectionId)) {
        setActiveSectionId(sections[0].id);
      }
    }
  }, [sections, activeSectionId]);

  const handleAddSection = () => {
    if (sections.length >= 4) return;

    const newSectionId = `section-${Date.now()}`;
    const newSection: PublicationSection = {
      id: newSectionId,
      title: `Seção ${sections.length + 1}`,
      content: "",
    };

    onUpdate({
      ...data,
      sections: [...sections, newSection],
    });
    setActiveSectionId(newSectionId);
  };

  const handleUpdateTitle = (id: string, title: string) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, title } : sec
    );
    onUpdate({ ...data, sections: updated });
  };

  const handleUpdateContent = (id: string, content: string) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, content } : sec
    );
    onUpdate({ ...data, sections: updated });
  };

  const handleConfirmDeleteSection = () => {
    if (!deleteSectionId) return;
    const updated = sections.filter((sec) => sec.id !== deleteSectionId);
    onUpdate({ ...data, sections: updated });
    if (updated.length > 0) {
      setActiveSectionId(updated[0].id);
    }
    setDeleteSectionId(null);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const newSections = [...sections];
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    onUpdate({ ...data, sections: newSections });
  };

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const activeSectionIndex = sections.findIndex((s) => s.id === activeSectionId);

  if (!isEditing && sections.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium">Nenhuma publicação registrada</h3>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
          Este pesquisador ainda não possui publicações cadastradas no portfólio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Título Principal */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight mb-6">Publicações</h2>

        {isEditing && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted text-muted-foreground border">
              {sections.length}/4 seções
            </span>
            <Button
              onClick={handleAddSection}
              disabled={sections.length >= 4}
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Adicionar Seção
            </Button>
          </div>
        )}
      </div>

      {isEditing && sections.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20 my-6">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold">Nenhuma seção adicionada ainda</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto mb-4">
            Crie até 4 seções para organizar suas publicações em abas (ex: Visão Geral, Projetos, Publicações, Apresentações).
          </p>
          <Button onClick={handleAddSection} className="gap-2">
            <Plus className="w-4 h-4" /> Criar Primeira Seção
          </Button>
        </div>
      )}

      {/* Sub-Abas de Navegação (Padrão Visual solicitado) */}
      {sections.length > 0 && (
        <div className="border-b border-border/80 pt-2 pb-0 mb-6 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {sections.map((sec, index) => {
            const isActive = activeSectionId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSectionId(sec.id)}
                className={cn(
                  "px-5 py-2 text-sm transition-all cursor-pointer whitespace-nowrap -mb-[2px] rounded-t-sm",
                  isActive
                    ? "border-2 border-foreground bg-background text-foreground font-semibold shadow-xs"
                    : "text-primary hover:underline font-medium border-2 border-transparent"
                )}
              >
                {sec.title || `Seção ${index + 1}`}
              </button>
            );
          })}

          {/* Botão + Nova Aba dentro da barra de sub-abas */}
          {isEditing && sections.length < 4 && (
            <button
              type="button"
              onClick={handleAddSection}
              className="px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 border-2 border-dashed border-primary/40 rounded-t-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 -mb-[2px]"
              title="Adicionar nova aba/seção (máx. 4)"
            >
              <Plus className="w-4 h-4" /> Nova Aba
            </button>
          )}
        </div>
      )}

      {/* Conteúdo da Seção Ativa */}
      {activeSection && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {isEditing ? (
              <div className="flex-1 max-w-md">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Título desta Aba/Seção
                </label>
                <Input
                  value={activeSection.title}
                  onChange={(e) => handleUpdateTitle(activeSection.id, e.target.value)}
                  placeholder="ex: Visão Geral, Projetos, Publicações..."
                  className="font-bold text-xl"
                />
              </div>
            ) : (
              <h3 className="text-2xl font-bold text-foreground tracking-tight">
                {activeSection.title || "Visão Geral"}
              </h3>
            )}

            {isEditing && (
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleMove(activeSectionIndex, "left")}
                  disabled={activeSectionIndex === 0}
                  title="Mover aba para a esquerda"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleMove(activeSectionIndex, "right")}
                  disabled={activeSectionIndex === sections.length - 1}
                  title="Mover aba para a direita"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteSectionId(activeSection.id)}
                  title="Excluir esta Aba/Seção"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Conteúdo em Texto Livre com Editor RichText */}
          <div>
            {isEditing && (
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Conteúdo da Seção (Texto Livre com Links e Formatação)
              </label>
            )}
            <EditableField
              id={`pub-section-${activeSection.id}`}
              isEditing={isEditing}
              value={activeSection.content || ""}
              onSave={(val) => handleUpdateContent(activeSection.id, val)}
              multiline
              placeholder="Escreva aqui o texto livre desta seção. Insira parágrafos, destaques em negrito, links para outros recursos ou páginas (ex: página de Ferramentas!), DOIs, etc..."
              className="w-full text-justify text-base leading-relaxed"
              richText={true}
            />
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão Personalizado */}
      <ConfirmModal
        isOpen={!!deleteSectionId}
        onClose={() => setDeleteSectionId(null)}
        onConfirm={handleConfirmDeleteSection}
        title="Excluir Seção de Publicações"
        description="Tem certeza que deseja excluir esta seção? Todo o conteúdo e textos formatados nela serão permanentemente removidos."
        confirmText="Excluir Seção"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}
