"use client";

import { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LocalOption } from "@/domain/question-option.types";
import { useBuilderStore } from "@/store/builder.store";

interface MonitoredReadingConfigProps {
  questionId: string;
}

export function MonitoredReadingConfig({ questionId }: MonitoredReadingConfigProps) {
  const { options, updateOptionLocal, deleteOptionLocal, reorderOptionsLocal, addOption } = useBuilderStore();

  const questionOptions = useMemo(() => {
    return options
      .filter((o) => o.questionId === questionId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [options, questionId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const optionIds = useMemo(() => questionOptions.map((o) => o.id), [questionOptions]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questionOptions.findIndex((o) => o.id === active.id);
      const newIndex = questionOptions.findIndex((o) => o.id === over.id);

      const newOrder = arrayMove(questionOptions, oldIndex, newIndex);
      reorderOptionsLocal(questionId, newOrder);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-dashed">
      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Trechos de Leitura
      </h5>
      <p className="text-xs text-muted-foreground mb-4">
        Adicione os trechos que serão exibidos sequencialmente para o participante.
        O tempo de leitura de cada trecho será monitorado.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={optionIds} strategy={verticalListSortingStrategy}>
          <div className="mb-3 space-y-2 pl-1">
            {questionOptions.map((option, index) => (
              <ReadingChunkCard 
                key={option.id} 
                option={option} 
                index={index}
                onUpdate={updateOptionLocal} 
                onDelete={deleteOptionLocal} 
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="pl-6 mt-4">
        <Button 
          onClick={() => addOption(questionId)} 
          variant="outline" 
          size="sm"
          className="h-8 text-xs font-medium gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar Novo Trecho
        </Button>
      </div>
    </div>
  );
}

interface ReadingChunkCardProps {
  option: LocalOption;
  index: number;
  onUpdate: (id: string, updates: Partial<LocalOption>) => void;
  onDelete: (id: string) => void;
}

function ReadingChunkCard({ option, index, onUpdate, onDelete }: ReadingChunkCardProps) {
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
      className={`flex items-start gap-2 group mb-2 transition-colors ${isDragging ? 'ring-2 ring-primary rounded-md bg-muted/50' : ''}`}
    >
      <div 
        className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-colors p-1 mt-2"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground px-1">Trecho {index + 1}</span>
        <Textarea 
          value={option.label}
          onChange={(e) => onUpdate(option.id, { label: e.target.value })}
          placeholder="Cole ou digite o trecho de leitura aqui..."
          className="min-h-[80px] shadow-none focus-visible:ring-1 bg-transparent hover:bg-muted/30 transition-colors resize-y"
        />
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 mt-5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-opacity"
        onClick={() => onDelete(option.id)}
        title="Excluir Trecho"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
