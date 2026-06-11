"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { LocalQuestion, QuestionType } from "@/domain/question.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionList } from "./OptionList";
import { ScaleConfigurationPanel } from "./ScaleConfigurationPanel";
import { MediaSection } from "./media/MediaSection";
import { RuleSection } from "./rules/RuleSection";

interface QuestionCardProps {
  question: LocalQuestion;
  onUpdate: (id: string, updates: Partial<LocalQuestion>) => void;
  onDelete: (id: string) => void;
}

const QUESTION_TYPES: Omit<Record<QuestionType, string>, "SLIDER"> = {
  SHORT_TEXT: "Texto Curto",
  LONG_TEXT: "Texto Longo",
  MULTIPLE_CHOICE: "Múltipla Escolha",
  SINGLE_CHOICE: "Escolha Única",
  LIKERT: "Escala Likert",
  MEDIA_ONLY: "Apenas Mídia",
};

export function QuestionCard({
  question,
  onUpdate,
  onDelete,
}: QuestionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-background border rounded-lg shadow-sm mb-3 transition-colors hover:border-primary/50 ${isDragging ? "ring-2 ring-primary border-primary" : ""}`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing border-r bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-l-lg"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="pl-12 pr-4 py-3 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <Input
              value={question.title}
              onChange={(e) => onUpdate(question.id, { title: e.target.value })}
              placeholder="Digite a sua pergunta aqui..."
              className="font-medium bg-transparent border-transparent focus-visible:border-primary px-0 rounded-none h-8 shadow-none focus-visible:ring-0 transition-colors text-base"
            />
            <Input
              value={question.description || ""}
              onChange={(e) =>
                onUpdate(question.id, { description: e.target.value })
              }
              placeholder="Descrição ou ajuda para a pergunta (opcional)"
              className="text-sm text-muted-foreground bg-transparent border-transparent focus-visible:border-primary px-0 rounded-none h-6 shadow-none focus-visible:ring-0 transition-colors"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 mt-1"
            onClick={() => onDelete(question.id)}
            title="Excluir Pergunta"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4 border-t pt-3 mt-1">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              Tipo:
            </label>
            <select
              value={question.type}
              onChange={(e) =>
                onUpdate(question.id, { type: e.target.value as QuestionType })
              }
              className="text-sm bg-muted/50 border-transparent rounded px-2 py-1 focus:ring-1 focus:ring-primary outline-none"
            >
              {Object.entries(QUESTION_TYPES).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={question.isRequired}
              onChange={(e) =>
                onUpdate(question.id, { isRequired: e.target.checked })
              }
              className="rounded text-primary focus:ring-primary border-muted-foreground/30"
            />
            <span className="text-sm font-medium text-muted-foreground select-none">
              Obrigatória
            </span>
          </label>
        </div>

        <MediaSection questionId={question.id} isNew={question.isNew} />

        {["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(question.type) && (
          <OptionList questionId={question.id} />
        )}

        {["LIKERT", "SLIDER"].includes(question.type) && (
          <ScaleConfigurationPanel question={question} onUpdate={onUpdate} />
        )}

        {["SINGLE_CHOICE", "MULTIPLE_CHOICE", "LIKERT", "SLIDER"].includes(question.type) && (
          <RuleSection questionId={question.id} blockId={question.blockId} isNew={question.isNew} />
        )}
      </div>
    </div>
  );
}
