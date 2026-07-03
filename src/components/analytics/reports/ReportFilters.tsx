"use client";

import { useAnalyticsStore } from "@/store/analytics.store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ReportFilters({ filters, onChange }: { filters: any, onChange: (f: any) => void }) {
  const { navigation } = useAnalyticsStore();
  const allBlocks = navigation?.blocks || [];

  return (
    <div className="w-full animate-in fade-in slide-in-from-top-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros da Tabela</CardTitle>
          <CardDescription>Refine as respostas que aparecem na listagem abaixo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allBlocks.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Bloco Específico</Label>
                <Select 
                  value={filters.blockIds?.[0] || "ALL"} 
                  onValueChange={(val) => onChange({ ...filters, blockIds: val === "ALL" ? [] : [val] })}
                  disabled={allBlocks.length === 0}
                >
                  <SelectTrigger className="!h-12 text-base w-full">
                    <SelectValue placeholder="Todos os blocos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos os blocos</SelectItem>
                    {allBlocks.map(b => (
                      <SelectItem key={b.blockId} value={b.blockId}>
                        {b.title || `Bloco ${b.blockId.substring(0, 8)}...`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-sm">Data Inicial</Label>
              <input 
                type="date"
                className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={filters.dateRange?.from || ''}
                onChange={(e) => onChange({ ...filters, dateRange: { ...filters.dateRange, from: e.target.value } })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Data Final</Label>
              <input 
                type="date"
                className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={filters.dateRange?.to || ''}
                onChange={(e) => onChange({ ...filters, dateRange: { ...filters.dateRange, to: e.target.value } })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
