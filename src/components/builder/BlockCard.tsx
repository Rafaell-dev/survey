"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { LocalBlock } from "@/domain/block.types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QuestionList } from "./QuestionList";

interface BlockCardProps {
  block: LocalBlock;
  onUpdate: (id: string, updates: Partial<LocalBlock>) => void;
  onDelete: (id: string) => void;
}

export function BlockCard({ block, onUpdate, onDelete }: BlockCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`border border-border/50 shadow-sm relative group bg-card transition-colors hover:border-primary/50 ${isDragging ? 'ring-2 ring-primary border-primary' : ''}`}
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing border-r bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-l-xl"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <CardHeader className="pl-12 py-3 flex flex-row items-center justify-between border-b bg-muted/20 space-y-0">
        <div className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
          <span>Bloco {block.orderIndex + 1}</span>
          {block.isNew && <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">Novo</span>}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(block.id)}
          title="Excluir Bloco"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="pl-12 py-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Título do Bloco</label>
          <Input 
            value={block.title}
            onChange={(e) => onUpdate(block.id, { title: e.target.value })}
            placeholder="Ex: Dados Pessoais"
            className="font-medium bg-transparent border-transparent focus-visible:border-primary px-0 rounded-none h-auto py-1 shadow-none focus-visible:ring-0 transition-colors"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição (Opcional)</label>
          <Textarea 
            value={block.description}
            onChange={(e) => onUpdate(block.id, { description: e.target.value })}
            placeholder="Breve introdução sobre esta seção de perguntas..."
            className="min-h-[60px] resize-none bg-transparent border-transparent focus-visible:border-primary px-0 rounded-none shadow-none focus-visible:ring-0 transition-colors py-1"
          />
        </div>

        <QuestionList blockId={block.id} />
      </CardContent>
    </Card>
  );
}
