import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditableField } from './EditableField';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { portfolioCourseSchema, normalizeCourseUrl, teachingIntroSchema } from '@/lib/portfolio-validators';

export interface TeachingCourse {
  id: string;
  name: string;
  url: string;
  orderIndex: number;
}

export interface TeachingData {
  introText?: string;
  graduacao: TeachingCourse[];
  posGraduacao: TeachingCourse[];
  workshops: TeachingCourse[];
}

interface TeachingTabProps {
  data: TeachingData;
  isEditing: boolean;
  onUpdate: (data: TeachingData) => void;
}

interface SortableCourseItemProps {
  id: string;
  isEditing: boolean;
  children: React.ReactNode;
}

function SortableCourseItem({ id, isEditing, children }: SortableCourseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`relative group ${isEditing ? "pl-6" : ""} ${isDragging ? "opacity-50 z-10 bg-background" : ""}`}
    >
      {isEditing && (
        <button
          {...attributes}
          {...listeners}
          className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground p-1 z-10 hover:bg-muted rounded transition-all"
          title="Arrastar para reordenar"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      {children}
    </li>
  );
}

export function TeachingTab({ data, isEditing, onUpdate }: TeachingTabProps) {
  const [itemToDelete, setItemToDelete] = useState<{ category: keyof TeachingData, id: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent, category: keyof TeachingData) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const items = data[category];
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      const newArray = arrayMove(items, oldIndex, newIndex).map((item, index) => ({ ...item, orderIndex: index }));
      onUpdate({ ...data, [category]: newArray });
    }
  };

  const handleAdd = (category: keyof TeachingData) => {
    const newCourse: TeachingCourse = {
      id: `temp-${Date.now()}`,
      name: "Novo Curso",
      url: "",
      orderIndex: data[category].length
    };
    onUpdate({ ...data, [category]: [...data[category], newCourse] });
  };

  const handleUpdateItem = (category: keyof TeachingData, id: string, changes: Partial<TeachingCourse>) => {
    const newArray = data[category].map(c => c.id === id ? { ...c, ...changes } : c);
    onUpdate({ ...data, [category]: newArray });
  };

  const handleDelete = (category: keyof TeachingData, id: string) => {
    setItemToDelete({ category, id });
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const newArray = data[itemToDelete.category].filter(c => c.id !== itemToDelete.id);
      onUpdate({ ...data, [itemToDelete.category]: newArray });
      setItemToDelete(null);
    }
  };

  const renderSection = (title: string, category: keyof TeachingData) => {
    const items = data[category] || [];
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
          {isEditing && (
            <Button variant="outline" size="sm" onClick={() => handleAdd(category)} className="h-8 gap-1">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          )}
        </div>

        <ul className={`space-y-4 ${!isEditing ? "list-disc list-inside marker:text-muted-foreground/50" : ""} text-muted-foreground`}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, category)}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((course) => (
                <SortableCourseItem key={course.id} id={course.id} isEditing={isEditing}>
                  <div className={`inline-flex flex-col w-[90%] align-top ${isEditing ? 'gap-2 bg-muted/20 p-2 rounded-md border border-dashed' : ''}`}>
                    
                    {/* View Mode */}
                    {!isEditing && (
                      <div className="inline">
                        {course.url ? (
                          <a href={course.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">
                            {course.name}
                          </a>
                        ) : (
                          <span>{course.name}</span>
                        )}
                      </div>
                    )}

                    {/* Edit Mode */}
                    {isEditing && (
                      <>
                        <EditableField
                          id={`${category}-name-${course.id}`}
                          isEditing={true}
                          value={course.name}
                          onSave={(v) => handleUpdateItem(category, course.id, { name: v })}
                          placeholder="Nome do curso/disciplina"
                          className="w-full text-foreground font-medium"
                          validator={portfolioCourseSchema.shape.name}
                          maxLength={100}
                        />
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
                          <div className="flex-1">
                            <EditableField
                              id={`${category}-url-${course.id}`}
                              isEditing={true}
                              value={course.url}
                              onSave={(v) => handleUpdateItem(category, course.id, { url: normalizeCourseUrl(v) })}
                              placeholder="Link (opcional)..."
                              className="w-full text-sm h-8"
                              validator={portfolioCourseSchema.shape.url}
                              maxLength={200}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {isEditing && (
                    <button 
                      onClick={() => handleDelete(category, course.id)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded transition-all z-10"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </SortableCourseItem>
              ))}
            </SortableContext>
          </DndContext>
          {!isEditing && items.length === 0 && (
            <span className="text-sm italic">Nenhum item cadastrado.</span>
          )}
        </ul>
      </section>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-6">Ensino</h2>
        <div className="text-lg leading-relaxed text-muted-foreground mb-8">
          <EditableField
            id="teaching-intro-text"
            isEditing={isEditing}
            value={data.introText ?? "Abaixo estão listadas as disciplinas e workshops ministrados na graduação, pós-graduação e eventos práticos aplicados à pesquisa."}
            onSave={(v) => onUpdate({ ...data, introText: v })}
            multiline
            maxLength={500}
            showCount={isEditing}
            placeholder="Escreva uma breve introdução (máx 500 caracteres)..."
            className="w-full text-justify"
            validator={teachingIntroSchema}
          />
        </div>
      </section>

      {renderSection("Graduação", "graduacao")}
      {renderSection("Pós-Graduação", "posGraduacao")}
      {renderSection("Workshops", "workshops")}

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Remover Item"
        description="Tem certeza que deseja remover este item de ensino? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
