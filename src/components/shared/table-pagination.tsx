import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
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
}: TablePaginationProps<TData>) {
    const navigate = useNavigate({ from: "/products/" });

    const from = (page - 1) * pageSize + 1;
    const to = Math.min(from + pageSize - 1, total);
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
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 50, 100].map((size) => (
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
                        className="h-8 w-8"
                        disabled={!canGoBack}
                        onClick={() =>
                            navigate({
                                search: (prev) => ({ ...prev, page: 1 }),
                            })
                        }
                        size="icon"
                        variant="outline"
                    >
                        <IconChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        className="h-8 w-8"
                        disabled={!canGoBack}
                        onClick={() =>
                            navigate({
                                search: (prev) => ({
                                    ...prev,
                                    page: prev.page - 1,
                                }),
                            })
                        }
                        size="icon"
                        variant="outline"
                    >
                        <IconChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        className="h-8 w-8"
                        disabled={!canGoForward}
                        onClick={() =>
                            navigate({
                                search: (prev) => ({
                                    ...prev,
                                    page: prev.page + 1,
                                }),
                            })
                        }
                        size="icon"
                        variant="outline"
                    >
                        <IconChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        className="h-8 w-8"
                        disabled={!canGoForward}
                        onClick={() =>
                            navigate({
                                search: (prev) => ({
                                    ...prev,
                                    page: pageCount,
                                }),
                            })
                        }
                        size="icon"
                        variant="outline"
                    >
                        <IconChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
