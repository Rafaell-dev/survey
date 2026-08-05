import { useRef, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical, Link as LinkIcon, Info, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditableField } from './EditableField';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { portfolioToolItemSchema, normalizeCourseUrl, teachingIntroSchema } from '@/lib/portfolio-validators';
import { toast } from 'sonner';

export interface ToolItem {
  id: string;
  name: string;
  url: string;
  description: string;
  imageUrl?: string;
  orderIndex: number;
}

export interface ToolsData {
  introText?: string;
  items: ToolItem[];
}

interface ToolsTabProps {
  data: ToolsData;
  isEditing: boolean;
  onUpdate: (data: ToolsData) => void;
}

interface SortableToolCardProps {
  id: string;
  isEditing: boolean;
  children: React.ReactNode;
}

function SortableToolCard({ id, isEditing, children }: SortableToolCardProps) {
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
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group h-full flex flex-col ${isDragging ? "opacity-50 z-10" : ""}`}
    >
      {isEditing && (
        <button
          {...attributes}
          {...listeners}
          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing bg-background/80 text-foreground p-1.5 z-20 hover:bg-background rounded-md transition-all shadow-sm"
          title="Arrastar para reordenar"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  );
}

export function ToolsTab({ data, isEditing, onUpdate }: ToolsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const items = data.items || [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      const newArray = arrayMove(items, oldIndex, newIndex).map((item, index) => ({ ...item, orderIndex: index }));
      onUpdate({ ...data, items: newArray });
    }
  };

  const handleAdd = () => {
    const newTool: ToolItem = {
      id: `temp-${Date.now()}`,
      name: "Nova Ferramenta",
      url: "",
      description: "",
      orderIndex: items.length
    };
    onUpdate({ ...data, items: [...items, newTool] });
  };

  const handleUpdateItem = (id: string, changes: Partial<ToolItem>) => {
    const newArray = items.map(c => c.id === id ? { ...c, ...changes } : c);
    onUpdate({ ...data, items: newArray });
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const newArray = items.filter(c => c.id !== itemToDelete);
      onUpdate({ ...data, items: newArray });
      setItemToDelete(null);
    }
  };

  const triggerImageUpload = (id: string) => {
    setUploadingId(id);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingId) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato não suportado. Use JPG, PNG, WEBP ou GIF.");
      setUploadingId(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx 5MB).");
      setUploadingId(null);
      return;
    }

    try {
      // Lê o arquivo para um canvas e redimensiona
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 800px
          const MAX_SIZE = 800;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Output to webp to save space
          const dataUrl = canvas.toDataURL('image/webp', 0.8);
          
          handleUpdateItem(uploadingId, { imageUrl: dataUrl });
          toast.success("Imagem anexada com sucesso!");
          setUploadingId(null);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Erro ao processar a imagem.");
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hidden File Input for Image Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange} 
      />

      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-6">Ferramentas & Projetos</h2>
        <div className="text-lg leading-relaxed text-muted-foreground mb-8">
          <EditableField
            id="tools-intro-text"
            isEditing={isEditing}
            value={data.introText ?? "Aqui está o link de alguns recursos úteis para análises linguísticas e estatísticas."}
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

      <section>
        <div className="flex items-center justify-end mb-6">
          {isEditing && (
            <Button variant="outline" size="sm" onClick={handleAdd} className="h-8 gap-1">
              <Plus className="w-4 h-4" /> Adicionar Ferramenta
            </Button>
          )}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
              {items.map((tool) => (
                <SortableToolCard key={tool.id} id={tool.id} isEditing={isEditing}>
                  <div className={`flex flex-col h-full bg-card rounded-lg overflow-hidden border ${isEditing ? 'border-dashed border-primary/50' : 'border-border shadow-sm'}`}>
                    
                    {/* Image Header */}
                    <div className="relative aspect-video w-full bg-muted flex items-center justify-center overflow-hidden">
                      {tool.imageUrl ? (
                        <img src={tool.imageUrl} alt={tool.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-muted-foreground flex flex-col items-center">
                          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-xs font-medium uppercase tracking-wider opacity-50">Sem Capa</span>
                        </div>
                      )}
                      
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                             onClick={() => triggerImageUpload(tool.id)}>
                          {uploadingId === tool.id ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          ) : (
                            <span className="text-white text-sm font-medium flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" /> Alterar Capa
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* View Mode */}
                      {!isEditing && (
                        <>
                          <div className="mb-3">
                            {tool.url ? (
                              <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-foreground hover:text-primary transition-colors underline decoration-transparent hover:decoration-primary underline-offset-4 line-clamp-2">
                                {tool.name}
                              </a>
                            ) : (
                              <h3 className="text-lg font-bold text-foreground line-clamp-2">{tool.name}</h3>
                            )}
                          </div>
                          {tool.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {tool.description}
                            </p>
                          )}
                        </>
                      )}

                      {/* Edit Mode */}
                      {isEditing && (
                        <div className="space-y-4">
                          <EditableField
                            id={`name-${tool.id}`}
                            isEditing={true}
                            value={tool.name}
                            onSave={(v) => handleUpdateItem(tool.id, { name: v })}
                            placeholder="NOME DA FERRAMENTA"
                            className="w-full text-foreground font-bold text-lg uppercase"
                            validator={portfolioToolItemSchema.shape.name}
                            maxLength={100}
                          />
                          
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
                            <div className="flex-1">
                              <EditableField
                                id={`desc-${tool.id}`}
                                isEditing={true}
                                value={tool.description}
                                onSave={(v) => handleUpdateItem(tool.id, { description: v })}
                                placeholder="Descrição (ex: Tutorial para começar...)"
                                className="w-full text-sm text-muted-foreground leading-relaxed"
                                validator={portfolioToolItemSchema.shape.description}
                                multiline
                                maxLength={200}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                            <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
                            <div className="flex-1">
                              <EditableField
                                id={`url-${tool.id}`}
                                isEditing={true}
                                value={tool.url}
                                onSave={(v) => handleUpdateItem(tool.id, { url: normalizeCourseUrl(v) })}
                                placeholder="Link (obrigatório)..."
                                className="w-full text-xs h-8"
                                validator={portfolioToolItemSchema.shape.url}
                                maxLength={200}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <button 
                        onClick={() => handleDelete(tool.id)}
                        className="absolute bottom-4 right-4 p-2 bg-destructive/90 text-destructive-foreground hover:bg-destructive rounded-full transition-all shadow-md z-10"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </SortableToolCard>
              ))}
            </SortableContext>
          </div>
        </DndContext>
        
        {!isEditing && items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground italic bg-muted/20 rounded-lg border border-dashed">
            Nenhuma ferramenta cadastrada ainda.
          </div>
        )}
      </section>

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Remover Ferramenta/Projeto"
        description="Tem certeza que deseja remover este item? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
