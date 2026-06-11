import { SurveyStatus } from "@/domain/survey.types";
import { Badge } from "@/components/ui/badge";

interface SurveyStatusBadgeProps {
  status: SurveyStatus;
}

const statusConfig: Record<SurveyStatus, { label: string; className: string }> = {
  DRAFT: { label: "Rascunho", className: "bg-muted text-muted-foreground hover:bg-muted" },
  PUBLISHED: { label: "Publicado", className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200" },
  ARCHIVED: { label: "Arquivado", className: "bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200" },
};

export function SurveyStatusBadge({ status }: SurveyStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={`${config.className} font-medium`}>
      {config.label}
    </Badge>
  );
}
