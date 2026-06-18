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
    onPageChange: (page: number) => void;
    page: number; // 1-based, from Route.useSearch()
    pageCount: number; // from query data
    pageSize: number; // from Route.useSearch()
    table: Table<TData>;
    total: number;
}

export function TablePagination<TData>({
    table,
    total,
    page,
    pageSize,
    pageCount,
    onPageChange,
}: TablePaginationProps<TData>) {
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = total === 0 ? 0 : Math.min(from + pageSize - 1, total);
    const canGoBack = page > 1;
    const canGoForward = page < pageCount;

    return (
        <div className="flex w-full items-center justify-between px-2">
            <p className="text-muted-foreground text-sm">
                {from}–{to} of {total} rows
            </p>

            <div className="flex items-center gap-6">
                {/* Rows per page */}
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Rows per page</span>
                    <Select
                        onValueChange={(value) =>
                            table.setPageSize(Number(value))
                        }
                        value={String(pageSize)}
                    >
                        <SelectTrigger className="h-8 w-17.5">
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
                    Page {page} of {pageCount}
                </span>

                {/* Navigation — navigate directly, no table methods */}
                <div className="flex items-center gap-1">
                    <Button
                        aria-label="First page"
                        className="size-8"
                        disabled={!canGoBack}
                        onClick={() => onPageChange(1)}
                        size="icon"
                        variant="outline"
                    >
                        <IconChevronsLeft className="size-4" />
                    </Button>
                    <Button
                        aria-label="Previous page"
                        className="size-8"
                        disabled={!canGoBack}
                        onClick={() => onPageChange(page - 1)}
                        size="icon"
                        variant="outline"
                    >
                        <IconChevronLeft className="size-4" />
                    </Button>
                    <Button
                        aria-label="Next page"
                        className="size-8"
                        disabled={!canGoForward}
                        onClick={() => onPageChange(page + 1)}
                        size="icon"
                        variant="outline"
                    >
                        <IconChevronRight className="size-4" />
                    </Button>
                    <Button
                        aria-label="Last page"
                        className="size-8"
                        disabled={!canGoForward}
                        onClick={() => onPageChange(pageCount)}
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
