"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { LocalOption } from "@/domain/question-option.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OptionCardProps {
  option: LocalOption;
  onUpdate: (id: string, updates: Partial<LocalOption>) => void;
  onDelete: (id: string) => void;
}

export function OptionCard({ option, onUpdate, onDelete }: OptionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

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
      className={`flex items-center gap-2 group mb-2 transition-colors ${isDragging ? 'ring-2 ring-primary rounded-md bg-muted/50' : ''}`}
    >
      <div 
        className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-colors p-1"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex-1 flex items-center gap-2">
        <Input 
          value={option.label}
          onChange={(e) => onUpdate(option.id, { label: e.target.value })}
          placeholder="Rótulo da Opção (ex: Sim)"
          className="h-8 shadow-none focus-visible:ring-1 bg-transparent hover:bg-muted/30 transition-colors"
        />
        <Input 
          type="number"
          readOnly
          value={option.orderIndex + 1}
          className="h-8 w-24 shadow-none bg-muted/50 cursor-not-allowed text-muted-foreground text-sm"
          title="Valor sequencial automático"
        />
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-opacity"
        onClick={() => onDelete(option.id)}
        title="Excluir Opção"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
