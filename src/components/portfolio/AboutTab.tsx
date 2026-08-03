import { PortfolioEducation, PortfolioInterest, PortfolioProfile } from "@/services/portfolio.service";
import { EditableField } from "./EditableField";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}: AboutTabProps) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Biografia */}
      <section>
        <h2 className="text-3xl font-light mb-6 tracking-tight">Sobre</h2>
        <div className="text-lg leading-relaxed text-muted-foreground">
          <EditableField
            isEditing={isEditing}
            value={profile.aboutPt || ""}
            onSave={(v) => onUpdateProfile({ aboutPt: v })}
            multiline
            maxLength={500}
            showCount={isEditing}
            placeholder="Escreva sua biografia aqui (máx 500 caracteres)..."
            className="w-full text-justify"
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
                <Plus className="w-4 h-4" /> Add
              </Button>
            )}
            {isEditing && interests.length >= 5 && (
              <span className="text-xs text-muted-foreground">Máx 5 itens</span>
            )}
          </div>
          
          <ul className="space-y-3 list-disc list-inside marker:text-muted-foreground/50 text-muted-foreground">
            {interests.map((interest) => (
              <li key={interest.id} className="relative group">
                <div className="inline-block w-[80%] align-top">
                  <EditableField
                    isEditing={isEditing}
                    value={interest.namePt}
                    onSave={(v) => onUpdateInterest?.(interest.id, { namePt: v })}
                    placeholder="Novo interesse..."
                    className="-ml-2 px-2"
                  />
                </div>
                {isEditing && (
                  <button 
                    onClick={() => onDeleteInterest?.(interest.id)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
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
                <Plus className="w-4 h-4" /> Add
              </Button>
            )}
            {isEditing && educations.length >= 5 && (
              <span className="text-xs text-muted-foreground">Máx 5 itens</span>
            )}
          </div>

          <div className="space-y-6">
            {educations.map((edu) => (
              <div key={edu.id} className="relative group pl-8">
                {/* Ícone de capelo estático para todos (como na referência) */}
                <div className="absolute left-0 top-1 text-muted-foreground/50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                
                <div className="w-[90%]">
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <div className="font-medium text-foreground flex-1 min-w-[200px]">
                      <EditableField
                        isEditing={isEditing}
                        value={edu.degreePt}
                        onSave={(v) => onUpdateEducation?.(edu.id, { degreePt: v })}
                        placeholder="Curso/Grau (ex: Doutorado em Linguística)"
                        className="font-semibold text-lg p-0"
                      />
                    </div>
                    <div className="text-muted-foreground text-sm">
                      <EditableField
                        isEditing={isEditing}
                        value={edu.year.toString()}
                        onSave={(v) => onUpdateEducation?.(edu.id, { year: parseInt(v) || new Date().getFullYear() })}
                        placeholder="Ano"
                        className="w-16 text-right p-0"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <EditableField
                      isEditing={isEditing}
                      value={edu.institution}
                      onSave={(v) => onUpdateEducation?.(edu.id, { institution: v })}
                      placeholder="Instituição"
                      className="p-0"
                    />
                  </div>
                </div>

                {isEditing && (
                  <button 
                    onClick={() => onDeleteEducation?.(edu.id)}
                    className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-2 text-destructive hover:bg-destructive/10 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {!isEditing && educations.length === 0 && (
              <div className="text-sm italic text-muted-foreground">Nenhuma formação listada.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
