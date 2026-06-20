import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionAnalyticsDTO } from "@/domain/analytics.types";

export function ReportChart({ data }: { data: QuestionAnalyticsDTO }) {
  if (!data.options || data.options.length === 0) return null;

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader className="pb-3 border-b mb-4">
        <CardTitle className="text-lg">
          Gráfico: Pergunta {data.questionId.substring(0, 8)}...
          <span className="ml-2 text-xs font-normal px-2 py-1 bg-secondary rounded-full">
            {data.type}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.options.map(opt => (
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
      </CardContent>
    </Card>
  );
}
