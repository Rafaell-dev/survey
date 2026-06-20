import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionAnalyticsDTO } from "@/domain/analytics.types";

export function ReportChart({ data }: { data: QuestionAnalyticsDTO }) {
  if (!data.options || data.options.length === 0) return null;

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader className="pb-3 border-b mb-4">
        <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-center gap-2">
          <span>{data.questionTitle || `Pergunta ${data.questionId.substring(0, 8)}...`}</span>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {data.blockTitle && (
              <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">
                {data.blockTitle}
              </span>
            )}
            <span className="text-xs font-normal px-2 py-1 bg-secondary rounded-full">
              {data.type}
            </span>
          </div>
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
