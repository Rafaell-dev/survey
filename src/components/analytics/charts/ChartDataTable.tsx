import { QuestionChartProps } from "../types";

export function ChartDataTable({ question, visualization }: QuestionChartProps) {
  if (!visualization.showTable || !question.options || question.options.length === 0) {
    return null;
  }

  // Se a ordenação estiver ligada, a tabela respeitará
  let data = [...question.options];
  if (visualization.sortEnabled) {
    data = data.sort((a, b) => 
      visualization.sortDirection === 'ASC' ? a.count - b.count : b.count - a.count
    );
  }

  return (
    <div className="mt-6 border rounded-md overflow-hidden bg-background">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Resposta</th>
              <th className="px-4 py-3 font-medium text-right w-32">Quantidade</th>
              <th className="px-4 py-3 font-medium text-right w-32">%</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((opt) => (
              <tr key={opt.optionId} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{opt.label}</td>
                <td className="px-4 py-3 text-right">{opt.count}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{opt.percentage}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/50 font-semibold border-t">
            <tr>
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right">{data.reduce((sum, opt) => sum + opt.count, 0)}</td>
              <td className="px-4 py-3 text-right">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
