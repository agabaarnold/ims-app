import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Badge } from "#/components/ui/badge";
import { Button, buttonVariants } from "#/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "#/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table";
import { stockTransfersQueryOptions } from "#/features/stock-transfers/functions/queries";

const PAGE_SIZE = 10;

const STATUS_VARIANT: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
> = {
    PENDING: "secondary",
    COMPLETED: "default",
    CANCELLED: "destructive",
};

const searchSchema = z.object({
    page: z.number().int().min(1).default(1),
    status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
});

export const Route = createFileRoute("/_app/stock-transfers/")({
    validateSearch: searchSchema,
    loaderDeps: ({ search }) => search,
    loader: ({ context: { queryClient }, deps: { page, status } }) =>
        queryClient.ensureQueryData(
            stockTransfersQueryOptions({ page, pageSize: PAGE_SIZE, status })
        ),
    component: StockTransfersPage,
});

function StockTransfersPage() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();

    const { data } = useSuspenseQuery(
        stockTransfersQueryOptions({
            page: search.page,
            pageSize: PAGE_SIZE,
            status: search.status,
        })
    );

    const fmt = new Intl.DateTimeFormat("en-UG", { dateStyle: "medium" });

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                        Stock transfers
                    </h1>
                    <p className="mt-1 text-muted-foreground text-sm">
                        Move inventory between your warehouses.
                    </p>
                </div>

                <Link className={buttonVariants()} to="/stock-transfers/new">
                    New transfer
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <Select
                    onValueChange={(value) =>
                        navigate({
                            search: (prev) => ({
                                ...prev,
                                status:
                                    value === "ALL"
                                        ? undefined
                                        : (value as typeof search.status),
                                page: 1,
                            }),
                        })
                    }
                    value={search.status ?? "ALL"}
                >
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All statuses</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Items</TableHead>
                        <TableHead>Created by</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.transfers.length === 0 ? (
                        <TableRow>
                            <TableCell
                                className="py-8 text-center text-muted-foreground"
                                colSpan={6}
                            >
                                No transfers found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.transfers.map((transfer) => (
                            <TableRow key={transfer.id}>
                                <TableCell>
                                    <Link
                                        className="font-medium hover:underline"
                                        params={{ transferId: transfer.id }}
                                        to="/stock-transfers/$transferId"
                                    >
                                        {transfer.fromWarehouse.name}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {transfer.toWarehouse.name}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            STATUS_VARIANT[transfer.status] ??
                                            "outline"
                                        }
                                    >
                                        {transfer.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {transfer._count.items}
                                </TableCell>
                                <TableCell>{transfer.createdBy.name}</TableCell>
                                <TableCell>
                                    {fmt.format(new Date(transfer.createdAt))}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                    Page {search.page} of {Math.max(data.pageCount, 1)}
                </p>
                <div className="flex gap-2">
                    <Button
                        disabled={search.page <= 1}
                        onClick={() =>
                            navigate({
                                search: (prev) => ({
                                    ...prev,
                                    page: prev.page - 1,
                                }),
                            })
                        }
                        size="sm"
                        variant="outline"
                    >
                        Previous
                    </Button>
                    <Button
                        disabled={search.page >= data.pageCount}
                        onClick={() =>
                            navigate({
                                search: (prev) => ({
                                    ...prev,
                                    page: prev.page + 1,
                                }),
                            })
                        }
                        size="sm"
                        variant="outline"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
