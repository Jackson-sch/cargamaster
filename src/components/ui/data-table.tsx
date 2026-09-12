"use client";

import * as React from "react";
import {
  ColumnDef,
  Column,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  SlidersHorizontal,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Column Header with Sort ---
interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("text-slate-400 font-semibold", className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted();

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className={cn(
        "flex items-center gap-1.5 font-semibold text-slate-400 hover:text-amber-400 transition-colors group -ml-1 px-1 py-0.5 rounded",
        isSorted && "text-amber-400",
        className
      )}
    >
      <span>{title}</span>
      {isSorted === "desc" ? (
        <ArrowDown className="h-3.5 w-3.5 text-amber-400" />
      ) : isSorted === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5 text-amber-400" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}

// --- Pagination Controls ---
interface DataTablePaginationProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 25, 50, 100],
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="p-3 bg-[#0B1220] border-t border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
      <div className="flex items-center gap-2">
        <span>Mostrando</span>
        <span className="font-mono font-semibold text-white">
          {startRow}-{endRow}
        </span>
        <span>de</span>
        <span className="font-mono font-semibold text-amber-400">{totalRows}</span>
        <span>registros</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Filas por pág:</span>
          <select
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-7 bg-[#111827] border border-[#1F2937] rounded px-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 font-mono text-[11px]">
          <span>Pág.</span>
          <span className="text-white font-bold">{pageIndex + 1}</span>
          <span>de</span>
          <span className="text-slate-300">{pageCount || 1}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            title="Primera página"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            title="Página anterior"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            title="Página siguiente"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            title="Última página"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main DataTable Component ---
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumnId?: string;
  initialPageSize?: number;
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ElementType;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Buscar registros...",
  searchColumnId,
  initialPageSize = 10,
  toolbarLeft,
  toolbarRight,
  emptyTitle = "No se encontraron registros",
  emptyDescription = "Intente ajustar los filtros de búsqueda o registre un nuevo elemento.",
  emptyIcon: EmptyIcon = Inbox,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
  });

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl space-y-0">
      {/* Toolbar */}
      <div className="p-4 border-b border-[#1F2937] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0B1220]">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <div className="relative w-full sm:w-72">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full h-8 bg-[#111827] border border-[#1F2937] rounded pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          {toolbarLeft}
        </div>

        {toolbarRight && (
          <div className="flex items-center gap-2 shrink-0">{toolbarRight}</div>
        )}
      </div>

      {/* Table Container */}
      <div className="relative w-full overflow-auto custom-scrollbar">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
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
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center p-6 space-y-2">
                    <EmptyIcon className="h-10 w-10 text-slate-600 mb-1" />
                    <h4 className="text-sm font-semibold text-slate-300">{emptyTitle}</h4>
                    <p className="text-xs text-slate-500 max-w-sm">{emptyDescription}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <DataTablePagination table={table} />
    </div>
  );
}
