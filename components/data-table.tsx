"use client";

import type React from "react";
import {
  type ColumnDef,
  flexRender,
  getFilteredRowModel,
  getCoreRowModel,
  type SortingState,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
  type PaginationState,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

// Extend ColumnDef directly with accessorKey as optional but with proper typing
type AccessorColumnDef<TData extends object> = ColumnDef<TData, any> & {
  id?: string;
  accessorKey?: keyof TData | string;
  header?: string | ((props: any) => React.ReactNode);
};

interface DataTableProps<TData extends object> {
  columns: AccessorColumnDef<TData>[];
  data: TData[];
  title: string;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusLower = status.toLowerCase();

  if (statusLower === "present") {
    return (
      <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold bg-[#331141] text-[#C372FC]  ">
        Present
      </span>
    );
  }

  if (statusLower === "absent") {
    return (
      <span className="inline-flex items-center px-4 py-1 rounded-full text-xs  bg-[#440E13] text-[#F13342] font-bold ">
        Absent
      </span>
    );
  }

  return <span>{status}</span>;
};

const shouldRenderAsStatus = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const valueLower = value.toLowerCase();
  return valueLower === "present" || valueLower === "absent";
};

export function DataTable<TData extends object>({
  columns,
  data,
  title,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTableProps<TData>) {
  const getInitialSortId = (columns: AccessorColumnDef<TData>[]) => {
    const hasClinic = columns.some(
      (col) => col.id === "clinic" || col.accessorKey === "clinic"
    );
    return hasClinic
      ? "clinic"
      : columns[0]?.id || (columns[0]?.accessorKey as string) || "";
  };

  const [sorting, setSorting] = useState<SortingState>([
    { id: getInitialSortId(columns), desc: false },
  ]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [paginate, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<TData | null>(null);
  const [isTableVisible, setIsTableVisible] = useState(true);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: paginate,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleRowClick = (rowData: TData, event: React.MouseEvent) => {
    const locationColumnIndex = columns.findIndex(
      (col) => col.accessorKey === "location" || col.id === "location"
    );
    const cellIndex = (event.target as HTMLElement).closest("td")?.cellIndex;
    if (cellIndex !== undefined && cellIndex === locationColumnIndex) {
      return;
    }
    setSelectedRowData(rowData);
    setIsModalOpen(true);
  };

  // Function to handle CSV download
  const handleDownloadCSV = () => {
    const headers = columns
      .map((col) => {
        const label =
          typeof col.header === "string"
            ? col.header
            : col.id || String(col.accessorKey);
        return `"${label}"`;
      })
      .join(",");

    const rows = table.getFilteredRowModel().rows.map((row) =>
      columns
        .map((col) => {
          const key = col.accessorKey || col.id;
          if (!key) return '""';
          const value = row.original[key as keyof TData];
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "table-data.csv");
    link.click();
    URL.revokeObjectURL(url);
  };

  // Function to toggle table visibility
  const toggleTableVisibility = () => {
    setIsTableVisible(!isTableVisible);
  };

  const renderRowDetails = (data: TData) => {
    if (!data) return null;
    return (
      <div className="space-y-4">
        {columns.map((column) => {
          const key = column.accessorKey;
          let value: unknown = undefined;

          if (typeof key === "string" && key in data) {
            value = (data as Record<string, unknown>)[key];
          } else if (typeof key !== "undefined") {
            value = data[key as keyof TData];
          }

          const label =
            typeof column.header === "string"
              ? column.header
              : column.id || String(key);

          if (!key || value === undefined) return null;

          return (
            <div key={String(key)} className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-400">
                {label}
              </label>
              <div className="text-sm">
                {shouldRenderAsStatus(value) ? (
                  <StatusBadge status={String(value)} />
                ) : (
                  <span className="primary-text">{String(value)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getPageNumbers = () => {
    const totalPages = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex + 1;
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div>
      <h2 className="mb-10 text-primary text-3xl font-extrabold">{title}</h2>
      <div className="items-center md:flex-row flex-col pb-4 flex justify-between gap-3">
        {data.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 primary-text"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
            <Button
              onClick={toggleTableVisibility}
              className="flex items-center gap-2 primary-text"
            >
              {isTableVisible ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Table
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show Table
                </>
              )}
            </Button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="w-[140px] primary-text border-main">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search...."
              value={globalFilter ?? ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="pl-10 max-w-sm primary-text border border-main text-sm"
            />
          </div>
        </div>
      </div>

      {isTableVisible && (
        <div className="rounded-xl overflow-hidden border border-main">
          <div
            className="custom-scrollbar overflow-auto"
            style={{ maxHeight: "450px" }}
          >
            <Table className="w-full">
              <TableHeader className="sticky">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-4 border-main">
                    {headerGroup.headers.map((header, index) => (
                      <TableHead
                        key={header.id}
                        className={`primary-text font-bold ${
                          index === 0 ? "rounded-tl-xl" : ""
                        } ${
                          index === headerGroup.headers.length - 1
                            ? "rounded-tr-xl"
                            : ""
                        }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody className="primary-text font-normal">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className={`hover:bg-secondary-800 hover:text-card border-none cursor-pointer transition-colors ${
                        index % 2 === 0 ? "bg-primary-50" : "bg-primary-100"
                      }`}
                      onClick={(event) => handleRowClick(row.original, event)}
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => {
                        const cellValue = cell.getValue();

                        return (
                          <TableCell
                            key={cell.id}
                            className={`${
                              index === table.getRowModel().rows.length - 1 &&
                              cellIndex === 0
                                ? "rounded-bl-xl"
                                : ""
                            } ${
                              index === table.getRowModel().rows.length - 1 &&
                              cellIndex === row.getVisibleCells().length - 1
                                ? "rounded-br-xl"
                                : ""
                            }`}
                          >
                            {shouldRenderAsStatus(cellValue) ? (
                              <StatusBadge status={String(cellValue)} />
                            ) : (
                              flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center rounded-b-xl"
                    >
                      No data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {table.getPageCount() > 1 && (
        <div className="flex md:flex-row flex-col items-center justify-between pt-4">
          <div className="text-sm primary-text">
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} entries
            {globalFilter && ` (filtered from ${data.length} total entries)`}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  className={
                    !table.getCanPreviousPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer primary-text"
                  }
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis className="primary-text" />
                  ) : (
                    <PaginationLink
                      onClick={() => table.setPageIndex((page as number) - 1)}
                      isActive={
                        table.getState().pagination.pageIndex + 1 === page
                      }
                      className="cursor-pointer primary-text"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  className={
                    !table.getCanNextPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer primary-text"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{title} Row Details</DialogTitle>
            <DialogDescription>
              Detailed information for the {title} row.
            </DialogDescription>
          </DialogHeader>
          {selectedRowData && renderRowDetails(selectedRowData)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
