"use client";

import * as React from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ResponsesAnalyticsDTO } from "@/domain/analytics.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

interface IndividualResponsesTableProps {
  data: ResponsesAnalyticsDTO;
}

export function IndividualResponsesTable({ data }: IndividualResponsesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns = React.useMemo<ColumnDef<any>[]>(() => {
    return data.headers.map(header => ({
      accessorKey: header.key,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2 font-semibold hover:bg-transparent hover:text-foreground"
          >
            {header.label}
            <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const val = row.getValue(header.key) as any;
        if (header.key === 'status') {
           return (
             <Badge variant={val === 'Concluída' ? 'default' : 'secondary'} className={val === 'Concluída' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
               {val}
             </Badge>
           );
        }
        if (header.key === 'startedAt' || header.key === 'finishedAt') {
           return val ? new Date(val).toLocaleString() : '-';
        }
        return val || '-';
      },
      meta: {
        questionType: header.questionType
      }
    }));
  }, [data.headers]);

  const table = useReactTable({
    data: data.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      }
    }
  })

  if (data.rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-lg bg-card/50">
        <p className="text-muted-foreground text-sm">
          Nenhuma resposta encontrada com os filtros atuais.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table wrapperClassName="min-h-[500px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as any;
                  return (
                    <TableHead 
                      key={header.id} 
                      className="whitespace-nowrap"
                      title={meta?.questionType ? `Tipo: ${meta.questionType}` : ""}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap max-w-[300px] truncate" title={String(cell.getValue() || '-')}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
          Total de {table.getFilteredRowModel().rows.length} resultados.
        </div>
        <div className="flex items-center space-x-2 sm:space-x-6 lg:space-x-8">
          <div className="flex items-center justify-center text-sm font-medium">
            Pág. {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir para primeira página</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir para página anterior</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir para próxima página</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir para última página</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
