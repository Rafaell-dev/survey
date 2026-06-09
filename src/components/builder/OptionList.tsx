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
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { useBuilderStore } from "@/store/builder.store";
import { OptionCard } from "./OptionCard";
import { Button } from "@/components/ui/button";

interface OptionListProps {
  questionId: string;
}

export function OptionList({ questionId }: OptionListProps) {
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
        Opções de Resposta
      </h5>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={optionIds} strategy={verticalListSortingStrategy}>
          <div className="mb-3 space-y-1 pl-1">
            {questionOptions.map((option) => (
              <OptionCard 
                key={option.id} 
                option={option} 
                onUpdate={updateOptionLocal} 
                onDelete={deleteOptionLocal} 
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="pl-6">
        <Button 
          onClick={() => addOption(questionId)} 
          variant="ghost" 
          size="sm"
          className="h-7 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar Opção
        </Button>
      </div>
    </div>
  );
}
