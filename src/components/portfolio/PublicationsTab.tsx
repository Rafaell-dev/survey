"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditableField } from "./EditableField";
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

  const handleAddSection = () => {
    if (sections.length >= 4) return;

    const newSection: PublicationSection = {
      id: `section-${Date.now()}`,
      title: `Nova Seção ${sections.length + 1}`,
      content: "",
    };

    onUpdate({
      ...data,
      sections: [...sections, newSection],
    });
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

  const handleDeleteSection = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta seção de publicações?")) return;
    const updated = sections.filter((sec) => sec.id !== id);
    onUpdate({ ...data, sections: updated });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    onUpdate({ ...data, sections: newSections });
  };

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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header da Aba */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Publicações</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Artigos, livros, capítulos e trabalhos acadêmicos em destaque.
          </p>
        </div>

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
        <div className="text-center py-10 border-2 border-dashed rounded-xl bg-muted/20">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold">Nenhuma seção adicionada</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto mb-4">
            Você pode adicionar até 4 seções de publicações (ex: "Artigos Científicos", "Livros", "Capítulos", "Eventos").
          </p>
          <Button onClick={handleAddSection} className="gap-2">
            <Plus className="w-4 h-4" /> Criar Primeira Seção
          </Button>
        </div>
      )}

      {/* Lista de Seções */}
      <div className="space-y-8">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={cn(
              "rounded-xl transition-all",
              isEditing
                ? "border bg-card p-6 shadow-sm space-y-4"
                : "space-y-3 pb-6 border-b last:border-b-0"
            )}
          >
            {/* Cabeçalho da Seção */}
            <div className="flex items-center justify-between gap-4">
              {isEditing ? (
                <div className="flex-1 max-w-md">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Título da Seção {index + 1}
                  </label>
                  <Input
                    value={section.title}
                    onChange={(e) => handleUpdateTitle(section.id, e.target.value)}
                    placeholder="ex: Artigos Científicos, Livros..."
                    className="font-semibold text-lg"
                  />
                </div>
              ) : (
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                  {section.title || `Seção ${index + 1}`}
                </h3>
              )}

              {isEditing && (
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    title="Mover para cima"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === sections.length - 1}
                    title="Mover para baixo"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteSection(section.id)}
                    title="Excluir Seção"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Conteúdo Texto Livre (RichText) */}
            <div className="mt-2">
              {isEditing && (
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Conteúdo da Seção (Texto Livre com Links e Formatação)
                </label>
              )}
              <EditableField
                id={`pub-section-${section.id}`}
                isEditing={isEditing}
                value={section.content || ""}
                onSave={(val) => handleUpdateContent(section.id, val)}
                multiline
                placeholder="Insira aqui o texto livre desta seção (ex: citações de artigos, títulos em negrito, links para periódicos, DOIs, etc)..."
                className="w-full text-justify text-base leading-relaxed"
                richText={true}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
