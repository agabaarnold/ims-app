import { useNavigate } from "@tanstack/react-router";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type OnChangeFn,
    type PaginationState,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { TablePagination } from "#/components/shared/table-pagination";
import { Input } from "#/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table";

interface ProductTableProps<PData, PValue> {
    columns: ColumnDef<PData, PValue>[];
    data: PData[];
    page: number;
    pageCount: number;
    pageSize: number;
    total: number;
}

export function ProductTable<PData, PValue>({
    columns,
    data,
    page,
    pageCount,
    pageSize,
    total,
}: ProductTableProps<PData, PValue>) {
    const navigate = useNavigate({ from: "/products/" });

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    const pagination: PaginationState = {
        pageIndex: page - 1,
        pageSize,
    };

    const handlePaginationChange: OnChangeFn<PaginationState> = (
        updaterOrValue
    ) => {
        const next =
            typeof updaterOrValue === "function"
                ? updaterOrValue(pagination)
                : updaterOrValue;

        navigate({
            search: (prev) => ({
                ...prev,
                page: next.pageIndex + 1,
                pageSize: next.pageSize,
            }),
        });
    };

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: handlePaginationChange,
        manualPagination: true,
        pageCount,
        state: { sorting, globalFilter, pagination },
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Input
                    className="max-w-sm"
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Search..."
                    value={globalFilter}
                />
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        colSpan={header.colSpan}
                                        key={header.id}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    className="h-24 text-center"
                                    colSpan={columns.length}
                                >
                                    No products found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex w-full items-center justify-between">
                <TablePagination table={table} total={total} />
            </div>
        </div>
    );
}
