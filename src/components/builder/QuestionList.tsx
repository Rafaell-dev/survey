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
import { QuestionCard } from "./QuestionCard";
import { Button } from "@/components/ui/button";

interface QuestionListProps {
  blockId: string;
}

export function QuestionList({ blockId }: QuestionListProps) {
  const { questions, updateQuestionLocal, deleteQuestionLocal, reorderQuestionsLocal, addQuestion } = useBuilderStore();

  const blockQuestions = useMemo(() => {
    return questions
      .filter((q) => q.blockId === blockId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [questions, blockId]);

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

  const questionIds = useMemo(() => blockQuestions.map((q) => q.id), [blockQuestions]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blockQuestions.findIndex((q) => q.id === active.id);
      const newIndex = blockQuestions.findIndex((q) => q.id === over.id);

      const newOrder = arrayMove(blockQuestions, oldIndex, newIndex);
      reorderQuestionsLocal(blockId, newOrder);
    }
  };

  return (
    <div className="mt-6 pt-4 border-t">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Perguntas</h4>
      </div>

      {blockQuestions.length === 0 ? (
        <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg bg-muted/10 mb-4">
          <p className="text-sm text-muted-foreground mb-4">
            Este bloco ainda não possui nenhuma pergunta.
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
            <div className="mb-4">
              {blockQuestions.map((question) => (
                <QuestionCard 
                  key={question.id} 
                  question={question} 
                  onUpdate={updateQuestionLocal} 
                  onDelete={deleteQuestionLocal} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Button 
        onClick={() => addQuestion(blockId, "SHORT_TEXT")} 
        variant="secondary" 
        size="sm"
        className="w-full gap-2 border-dashed border-2 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all bg-transparent hover:bg-secondary/10"
      >
        <Plus className="h-4 w-4" /> Adicionar Pergunta
      </Button>
    </div>
  );
}
