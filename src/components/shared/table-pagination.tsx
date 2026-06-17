import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

interface TablePaginationProps<TData> {
    table: Table<TData>;
    total: number;
}

export function TablePagination<TData>({
    table,
    total,
}: TablePaginationProps<TData>) {
    const { pageIndex, pageSize } = table.getState().pagination;
    const from = pageIndex * pageSize + 1;
    const to = Math.min(from + pageSize - 1, total);

    return (
        <div className="flex w-full items-center justify-between px-2">
            {/* Row count */}
            <p className="text-muted-foreground text-sm">
                {from}–{to} of {total} rows
            </p>

            <div className="flex items-center gap-6">
                {/* Page size selector */}
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Rows per page</span>
                    <Select
                        onValueChange={(value) =>
                            table.setPageSize(Number(value))
                        }
                        value={String(pageSize)}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[5, 10, 20, 50, 100].map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Page indicator */}
                <span className="font-medium text-sm">
                    Page {pageIndex + 1} of {table.getPageCount()}
                </span>

                {/* Navigation buttons */}
                <div className="flex items-center gap-1">
                    <Button
                        className="size-8"
                        disabled={!table.getCanPreviousPage()}
                        onClick={() => table.firstPage()}
                        size="icon"
                        variant="outline"
                    >
                        <IconChevronsLeft className="size-4" />
                    </Button>
                    <Button
                        className="size-8"
                        disabled={!table.getCanPreviousPage()}
                        onClick={() => table.previousPage()}
                        size="icon"
                        variant="outline"
                    >
                        <IconChevronLeft className="size-4" />
                    </Button>
                    <Button
                        className="size-8"
                        disabled={!table.getCanNextPage()}
                        onClick={() => table.nextPage()}
                        size="icon"
                        variant="outline"
                    >
                        <IconChevronRight className="size-4" />
                    </Button>
                    <Button
                        className="size-8"
                        disabled={!table.getCanNextPage()}
                        onClick={() => table.lastPage()}
                        size="icon"
                        variant="outline"
                    >
                        <IconChevronsRight className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
