import { Card, CardContent } from "@/components/ui/card";
import { ReportMetricDTO } from "@/domain/report.types";

export function ReportMetricCard({ metric, icon: Icon }: { metric: ReportMetricDTO, icon?: any }) {
  return (
    <Card className="border-primary/10 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
          {Icon && <Icon className="h-5 w-5 text-primary/50" />}
        </div>
        <div>
          <h3 className="text-3xl font-bold tracking-tight">{metric.value}</h3>
          {metric.description && (
            <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
