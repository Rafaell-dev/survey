import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionAnalyticsDTO } from "@/domain/analytics.types";

export function ReportTable({ data }: { data: QuestionAnalyticsDTO }) {
  if (!data.responses || !Array.isArray(data.responses) || data.responses.length === 0) return null;

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader className="pb-3 border-b mb-4">
        <CardTitle className="text-lg">
          Tabela: Respostas (Pergunta {data.questionId.substring(0, 8)}...)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border max-h-[300px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background/95 backdrop-blur z-10">
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left font-medium text-muted-foreground w-12">#</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Resposta Registrada</th>
              </tr>
            </thead>
            <tbody>
              {data.responses.map((text, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-4 align-middle text-muted-foreground">{i + 1}</td>
                  <td className="p-4 align-middle font-medium">"{text}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
