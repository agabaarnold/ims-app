import { useNavigate } from "@tanstack/react-router";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type OnChangeFn,
    type PaginationState,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
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
import { useDebounce } from "#/hooks/use-debounce";

interface ProductTableProps<PData, PValue> {
    columns: ColumnDef<PData, PValue>[];
    data: PData[];
    page: number;
    pageCount: number;
    pageSize: number;
    search: string;
    total: number;
}

export function ProductTable<PData, PValue>({
    columns,
    data,
    page,
    pageCount,
    pageSize,
    search,
    total,
}: ProductTableProps<PData, PValue>) {
    const navigate = useNavigate({ from: "/products/" });

    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchInput, setSearchInput] = useState(search);

    const debouncedSearch = useDebounce(searchInput, 500);

    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    useEffect(() => {
        navigate({
            search: (prev) => ({
                ...prev,
                search: debouncedSearch,
                page: 1,
            }),
            replace: true,
        });
    }, [debouncedSearch, navigate]);

    const pagination: PaginationState = {
        pageIndex: page - 1,
        pageSize,
    };

    const handlePaginationChange: OnChangeFn<PaginationState> = (
        updaterOrValue
    ) => {
        navigate({
            search: (prev) => {
                const current: PaginationState = {
                    pageIndex: (prev.page ?? 1) - 1,
                    pageSize: prev.pageSize ?? 20,
                };

                const next =
                    typeof updaterOrValue === "function"
                        ? updaterOrValue(current)
                        : updaterOrValue;

                return {
                    ...prev,
                    page: Math.max(1, next.pageIndex + 1),
                    pageSize: next.pageSize,
                };
            },
        });
    };

    const handlePageChange = (page: number) => {
        navigate({ search: (prev) => ({ ...prev, page }) });
    };

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onPaginationChange: handlePaginationChange,
        manualPagination: true,
        pageCount,
        state: { sorting, pagination },
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Input
                    aria-label="Search products"
                    className="max-w-sm"
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search products..."
                    value={searchInput}
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
                                <TableRow
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                    key={row.id}
                                >
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

            <div className="flex items-center justify-between">
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                    <div className="text-muted-foreground text-sm">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s)
                        selected.
                    </div>
                )}

                <TablePagination
                    onPageChange={handlePageChange}
                    page={page}
                    pageCount={pageCount}
                    pageSize={pageSize}
                    table={table}
                    total={total}
                />
            </div>
        </div>
    );
}
