import { PortfolioEducation, PortfolioInterest, PortfolioProfile } from "@/services/portfolio.service";
import { EditableField } from "./EditableField";
import { Plus, Trash2, MapPin, Calendar, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { portfolioProfileSchema, portfolioInterestSchema, portfolioEducationSchema } from "@/lib/portfolio-validators";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ==============================
// SORTABLE COMPONENTS
// ==============================
function SortableInterestItem({ id, children, isEditing }: { id: string, children: React.ReactNode, isEditing: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !isEditing });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  
  return (
    <li ref={setNodeRef} style={style} className={`relative group flex items-start gap-2 ${isDragging ? 'z-50' : ''}`}>
      {isEditing && (
        <div {...attributes} {...listeners} className="mt-2 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      <div className="flex-1 relative">
        {children}
      </div>
    </li>
  );
}

function SortableEducationItem({ id, children, isEditing }: { id: string, children: React.ReactNode, isEditing: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !isEditing });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  
  return (
    <div ref={setNodeRef} style={style} className={`relative group pl-6 border-l-2 border-primary/20 pb-4 ${isDragging ? 'z-50 bg-background/50' : ''}`}>
      {isEditing && (
        <div {...attributes} {...listeners} className="absolute -left-10 top-2 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing bg-background p-1 rounded">
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      {children}
    </div>
  );
}

interface AboutTabProps {
  profile: Partial<PortfolioProfile>;
  interests: PortfolioInterest[];
  educations: PortfolioEducation[];
  isEditing: boolean;
  onUpdateProfile: (data: Partial<PortfolioProfile>) => void;
  onAddInterest?: () => void;
  onUpdateInterest?: (id: string, data: Partial<PortfolioInterest>) => void;
  onDeleteInterest?: (id: string) => void;
  onAddEducation?: () => void;
  onUpdateEducation?: (id: string, data: Partial<PortfolioEducation>) => void;
  onDeleteEducation?: (id: string) => void;
  onReorderInterests?: (newOrder: PortfolioInterest[]) => void;
  onReorderEducations?: (newOrder: PortfolioEducation[]) => void;
}

export function AboutTab({
  profile,
  interests,
  educations,
  isEditing,
  onUpdateProfile,
  onAddInterest,
  onUpdateInterest,
  onDeleteInterest,
  onAddEducation,
  onUpdateEducation,
  onDeleteEducation,
  onReorderInterests,
  onReorderEducations,
}: AboutTabProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEndInterests = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorderInterests) {
      const oldIndex = interests.findIndex(i => i.id === active.id);
      const newIndex = interests.findIndex(i => i.id === over.id);
      const newArray = arrayMove(interests, oldIndex, newIndex).map((item, index) => ({ ...item, orderIndex: index }));
      onReorderInterests(newArray);
    }
  };

  const handleDragEndEducations = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorderEducations) {
      const oldIndex = educations.findIndex(i => i.id === active.id);
      const newIndex = educations.findIndex(i => i.id === over.id);
      const newArray = arrayMove(educations, oldIndex, newIndex).map((item, index) => ({ ...item, orderIndex: index }));
      onReorderEducations(newArray);
    }
  };
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Biografia */}
      <section>
        <h2 className="text-3xl font-light mb-6 tracking-tight">Sobre</h2>
        <div className="text-lg leading-relaxed text-muted-foreground">
          <EditableField
            id="profile-about"
            isEditing={isEditing}
            value={profile.aboutPt || ""}
            onSave={(v) => onUpdateProfile({ aboutPt: v })}
            multiline
            maxLength={500}
            showCount={isEditing}
            placeholder="Escreva sua biografia aqui (máx 500 caracteres)..."
            className="w-full text-justify"
            validator={portfolioProfileSchema.shape.aboutPt}
          />
        </div>
      </section>

      {/* 2 Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Interesses */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold tracking-tight">Interesses</h3>
            {isEditing && interests.length < 5 && (
              <Button variant="outline" size="sm" onClick={onAddInterest} className="h-8 gap-1">
                <Plus className="w-4 h-4" /> Adicionar
              </Button>
            )}
            {isEditing && interests.length >= 5 && (
              <span className="text-xs text-muted-foreground">Máx 5 itens</span>
            )}
          </div>
          
          <ul className={`space-y-3 ${!isEditing ? "list-disc list-inside marker:text-muted-foreground/50" : ""} text-muted-foreground`}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndInterests}>
              <SortableContext items={interests.map(i => i.id)} strategy={verticalListSortingStrategy}>
                {interests.map((interest) => (
                  <SortableInterestItem key={interest.id} id={interest.id} isEditing={isEditing}>
                    <div className="inline-block w-[85%] align-top">
                      <EditableField
                        id={`interest-${interest.id}`}
                        isEditing={isEditing}
                        value={interest.namePt}
                        onSave={(v) => onUpdateInterest?.(interest.id, { namePt: v })}
                        placeholder="Novo interesse..."
                        className={isEditing ? "-ml-2 px-2" : "p-0 inline"}
                        validator={portfolioInterestSchema.shape.namePt}
                        maxLength={50}
                      />
                    </div>
                    {isEditing && (
                      <button 
                        onClick={() => onDeleteInterest?.(interest.id)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded transition-all z-10"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </SortableInterestItem>
                ))}
              </SortableContext>
            </DndContext>
            {!isEditing && interests.length === 0 && (
              <span className="text-sm italic">Nenhum interesse listado.</span>
            )}
          </ul>
        </section>

        {/* Formação */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold tracking-tight">Formação</h3>
            {isEditing && educations.length < 5 && (
              <Button variant="outline" size="sm" onClick={onAddEducation} className="h-8 gap-1">
                <Plus className="w-4 h-4" /> Adicionar
              </Button>
            )}
            {isEditing && educations.length >= 5 && (
              <span className="text-xs text-muted-foreground">Máx 5 itens</span>
            )}
          </div>

          <div className="space-y-4 ml-2 mt-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndEducations}>
              <SortableContext items={educations.map(e => e.id)} strategy={verticalListSortingStrategy}>
                {educations.map((edu) => (
                  <SortableEducationItem key={edu.id} id={edu.id} isEditing={isEditing}>
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-2.5 ring-4 ring-background"></div>
                    
                    <div className="w-[95%]">
                      <EditableField
                        id={`edu-degree-${edu.id}`}
                        isEditing={isEditing}
                        value={edu.degreePt}
                        onSave={(v) => onUpdateEducation?.(edu.id, { degreePt: v })}
                        placeholder="Curso/Grau (ex: Doutorado em Linguística)"
                        className="font-semibold text-lg p-1 -ml-1 w-full"
                        validator={portfolioEducationSchema.shape.degreePt}
                        maxLength={100}
                      />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-muted-foreground text-sm mt-2">
                        <div className="flex items-center gap-1 flex-1">
                          <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
                          <EditableField
                            id={`edu-inst-${edu.id}`}
                            isEditing={isEditing}
                            value={edu.institution}
                            onSave={(v) => onUpdateEducation?.(edu.id, { institution: v })}
                            placeholder="Instituição (ex: Universidade de São Paulo)"
                            className="p-1 -ml-1 w-full"
                            validator={portfolioEducationSchema.shape.institution}
                            maxLength={100}
                          />
                        </div>
                        
                        <div className="flex items-center gap-1 w-32">
                          <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
                          <EditableField
                            id={`edu-year-${edu.id}`}
                            isEditing={isEditing}
                            value={edu.year.toString()}
                            onSave={(v) => onUpdateEducation?.(edu.id, { year: parseInt(v) || new Date().getFullYear() })}
                            placeholder="Ano (ex: 2024)"
                            className="p-1 -ml-1 w-full"
                            validator={portfolioEducationSchema.shape.year}
                          />
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <button 
                        onClick={() => onDeleteEducation?.(edu.id)}
                        className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-2 text-destructive hover:bg-destructive/10 rounded transition-all z-10"
                        title="Remover formação"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </SortableEducationItem>
                ))}
              </SortableContext>
            </DndContext>
            {!isEditing && educations.length === 0 && (
              <div className="text-sm italic text-muted-foreground">Nenhuma formação listada.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
