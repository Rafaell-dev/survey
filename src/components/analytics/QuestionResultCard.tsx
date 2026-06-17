import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionAnalyticsDTO } from "@/domain/analytics.types";

interface QuestionResultCardProps {
  question: QuestionAnalyticsDTO;
  index: number;
}

export function QuestionResultCard({ question, index }: QuestionResultCardProps) {
  const renderOptionsChart = () => {
    if (!question.options || question.options.length === 0) {
      return <p className="text-sm text-muted-foreground">Nenhuma opção registrada.</p>;
    }

    return (
      <div className="space-y-4">
        {question.options.map(opt => (
          <div key={opt.optionId} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{opt.label}</span>
              <span className="text-muted-foreground">{opt.count} res ({opt.percentage}%)</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${opt.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderNumericStats = () => {
    return (
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-muted/50 p-3 rounded-lg border">
          <p className="text-xs text-muted-foreground uppercase">Média</p>
          <p className="text-xl font-bold">{question.average}</p>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg border">
          <p className="text-xs text-muted-foreground uppercase">Mínimo</p>
          <p className="text-xl font-bold">{question.minimum}</p>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg border">
          <p className="text-xs text-muted-foreground uppercase">Máximo</p>
          <p className="text-xl font-bold">{question.maximum}</p>
        </div>
        <div className="col-span-3 text-sm text-muted-foreground mt-2">
          Baseado em {question.responses} respostas
        </div>
      </div>
    );
  };

  const renderTextResponses = () => {
    if (!question.responses || !Array.isArray(question.responses) || question.responses.length === 0) {
      return <p className="text-sm text-muted-foreground">Nenhuma resposta em texto.</p>;
    }
    
    return (
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 border rounded-md p-3 bg-muted/20">
        {question.responses.map((text, i) => (
          <div key={i} className="text-sm border-b last:border-0 pb-2 mb-2 last:pb-0 last:mb-0">
            "{text}"
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader className="pb-3 border-b mb-4">
        <CardTitle className="text-lg">
          <span className="text-muted-foreground mr-2">{index + 1}.</span> 
          Questão {question.questionId.substring(0, 8)}... {/* Idealmente o title, mas a API só retorna ID */}
          <span className="ml-2 text-xs font-normal px-2 py-1 bg-secondary rounded-full">
            {question.type}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE' 
          ? renderOptionsChart()
          : question.type === 'LIKERT' || question.type === 'SLIDER'
          ? renderNumericStats()
          : renderTextResponses()
        }
      </CardContent>
    </Card>
  );
}
