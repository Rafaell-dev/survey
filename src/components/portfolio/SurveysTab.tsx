import { useState, useEffect } from "react";
import { Star, FileText } from "lucide-react";
import { portfolioService } from "@/services/portfolio.service";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SurveysTabProps {
  publicSurveys?: any[]; // Passado no modo público
  isEditing: boolean;
  onUpdate?: () => void;
}

export function SurveysTab({ publicSurveys = [], isEditing, onUpdate }: SurveysTabProps) {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadAdminSurveys();
    }
  }, [isEditing]);

  const loadAdminSurveys = async () => {
    try {
      setLoading(true);
      const data = await portfolioService.getPortfolioSurveys();
      setSurveys(data);
    } catch (error) {
      console.error("Erro ao carregar pesquisas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHighlight = async (id: string, current: boolean) => {
    try {
      // Optimistic update
      setSurveys(prev => prev.map(s => s.id === id ? { ...s, isHighlighted: !current } : s));
      await portfolioService.toggleSurveyHighlight(id, !current);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Erro ao favoritar pesquisa:", error);
      // Revert on error
      setSurveys(prev => prev.map(s => s.id === id ? { ...s, isHighlighted: current } : s));
    }
  };

  const displaySurveys = isEditing ? surveys : publicSurveys;

  if (loading && isEditing) {
    return <div className="text-center py-12 text-muted-foreground animate-pulse">Carregando suas pesquisas...</div>;
  }

  if (displaySurveys.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium">Nenhuma pesquisa para exibir</h3>
        {isEditing ? (
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Crie pesquisas na plataforma LingSurvey. Elas aparecerão aqui automaticamente para você destacar no seu portfólio.
          </p>
        ) : (
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Este pesquisador ainda não possui pesquisas em destaque.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isEditing && (
        <div className="bg-primary/5 border border-primary/20 rounded-md p-4 mb-8">
          <p className="text-sm text-foreground/80 text-center">
            Abaixo estão todas as suas pesquisas criadas na plataforma LingSurvey. Clique na estrela (⭐) para destacá-las no seu portfólio público.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displaySurveys.map((survey) => (
          <div 
            key={survey.id}
            className={cn(
              "group flex flex-col justify-between bg-card rounded-xl border p-6 transition-all duration-300",
              isEditing 
                ? "hover:border-primary hover:bg-primary/5" 
                : "hover:shadow-lg hover:border-primary hover:bg-primary/5 cursor-pointer"
            )}
            onClick={() => {
              if (!isEditing && survey.publicSlug) {
                window.open(`/survey/${survey.publicSlug}`, '_blank');
              }
            }}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                {isEditing && survey.status === 'PUBLISHED' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleHighlight(survey.id, survey.isHighlighted);
                    }}
                    className="p-2 -mr-2 -mt-2 rounded-full hover:bg-primary/10 transition-colors focus:outline-none"
                    title={survey.isHighlighted ? "Remover dos destaques" : "Destacar no portfólio"}
                  >
                    <Star 
                      className={cn(
                        "w-6 h-6 transition-colors", 
                        survey.isHighlighted ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-400"
                      )} 
                    />
                  </button>
                )}
                {!isEditing && survey.isHighlighted && (
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 opacity-80" />
                )}
              </div>
              
              <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:!text-primary transition-colors">
                {survey.title}
              </h3>
              
              <p className="text-muted-foreground text-sm line-clamp-3">
                {survey.description || "Nenhuma descrição fornecida para esta pesquisa."}
              </p>
            </div>

            {!isEditing && survey.publicSlug && (
              <div className="mt-6 pt-4 border-t text-sm font-medium !text-primary flex items-center justify-between">
                <span>Participar da pesquisa</span>
                <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-lg">
                  →
                </span>
              </div>
            )}
            
            {isEditing && !survey.publicSlug && survey.status === 'PUBLISHED' && (
              <div className="mt-4 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                Sem link público ativo.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
