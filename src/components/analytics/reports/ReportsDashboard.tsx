"use client";

import { useEffect, useState } from "react";
import { useAnalyticsStore } from "@/store/analytics.store";
import { ReportFilters } from "./ReportFilters";
import { IndividualResponsesTable } from "./IndividualResponsesTable";
import { Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportsDashboard({ surveyId }: { surveyId: string }) {
  const { loadIndividualResponses, individualResponses, loadingResponses } = useAnalyticsStore();
  const [filters, setFilters] = useState<any>({ status: 'ALL' });
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    loadIndividualResponses(surveyId, filters);
  }, [surveyId, filters, loadIndividualResponses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Respostas Individuais</h2>
          <p className="text-sm text-muted-foreground">
            Visualize os dados detalhados de cada participante que preencheu seu formulário.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-muted/30 p-2 rounded-lg border">
        <div className="relative flex-1 w-full max-w-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Pesquisar por participante..."
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={filters.participantIds?.[0] || ''}
            onChange={(e) => setFilters({ ...filters, participantIds: e.target.value ? [e.target.value] : [] })}
          />
        </div>
        
        <div className="flex items-center p-1 bg-muted rounded-md shrink-0 w-full md:w-auto overflow-x-auto hide-scrollbar">
          <Button 
            variant={filters.status === 'ALL' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilters({...filters, status: 'ALL'})}
            className="h-7 text-xs px-3 shadow-none data-[state=active]:shadow-sm"
          >
            Todas
          </Button>
          <Button 
            variant={filters.status === 'COMPLETED' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilters({...filters, status: 'COMPLETED'})}
            className="h-7 text-xs px-3 shadow-none"
          >
            Concluídas
          </Button>
          <Button 
            variant={filters.status === 'IN_PROGRESS' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilters({...filters, status: 'IN_PROGRESS'})}
            className="h-7 text-xs px-3 shadow-none"
          >
            Em Andamento
          </Button>
        </div>
        
        <Button 
          variant={showFilters ? "secondary" : "outline"} 
          onClick={() => setShowFilters(!showFilters)} 
          className="gap-2 shrink-0 h-9 ml-auto w-full md:w-auto"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Ocultar Filtros' : 'Filtros Avançados'}
        </Button>
      </div>

      {showFilters && (
        <div className="w-full">
          <ReportFilters filters={filters} onChange={setFilters} />
        </div>
      )}

      <div className="mt-4">
        {loadingResponses && !individualResponses ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : individualResponses ? (
          <div className="relative">
            {loadingResponses && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-md">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <IndividualResponsesTable data={individualResponses} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
