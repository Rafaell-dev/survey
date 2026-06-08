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
import { PlusCircle } from "lucide-react";

import { useBuilderStore } from "@/store/builder.store";
import { BlockCard } from "./BlockCard";
import { Button } from "@/components/ui/button";

export function BlockList() {
  const { blocks, updateBlockLocal, deleteBlockLocal, reorderBlocksLocal, addBlock } = useBuilderStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Só ativa o drag se mover 5px (pra não quebrar os cliques no botão/input)
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const blockIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      const newOrder = arrayMove(blocks, oldIndex, newIndex);
      reorderBlocksLocal(newOrder);
    }
  };

  return (
    <div className="space-y-6">
      {blocks.length === 0 ? (
        <div className="text-center py-16 px-6 border-2 border-dashed rounded-xl bg-muted/10">
          <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhum bloco criado</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Os blocos servem para agrupar e organizar suas perguntas em páginas separadas durante o preenchimento.
          </p>
          <Button onClick={addBlock} className="gap-2 bg-primary">
            <PlusCircle className="h-4 w-4" /> Adicionar Primeiro Bloco
          </Button>
        </div>
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {blocks.map((block) => (
                  <BlockCard 
                    key={block.id} 
                    block={block} 
                    onUpdate={updateBlockLocal} 
                    onDelete={deleteBlockLocal} 
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex justify-center mt-8 pt-4">
            <Button 
              onClick={addBlock} 
              variant="outline" 
              className="gap-2 border-dashed border-2 hover:bg-secondary/10 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all rounded-full px-8"
            >
              <PlusCircle className="h-5 w-5" /> Adicionar Novo Bloco
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
