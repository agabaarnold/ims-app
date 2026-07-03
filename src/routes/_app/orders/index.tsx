import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Badge } from "#/components/ui/badge";
import { Button, buttonVariants } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
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
import { ordersQueryOptions } from "#/features/orders/functions/queries";
import { ORDER_STATUSES } from "#/features/orders/schema";
import { useDebounce } from "#/hooks/use-debounce";

const PAGE_SIZE = 10;

const STATUS_VARIANT: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
> = {
    PENDING: "outline",
    CONFIRMED: "secondary",
    PICKING: "secondary",
    SHIPPED: "secondary",
    DELIVERED: "default",
    CANCELLED: "destructive",
    RETURNED: "destructive",
};

const searchSchema = z.object({
    page: z.number().int().min(1).default(1),
    search: z.string().default(""),
    status: z.enum(ORDER_STATUSES).optional(),
});

export const Route = createFileRoute("/_app/orders/")({
    validateSearch: searchSchema,
    loaderDeps: ({ search }) => search,
    loader: ({ context: { queryClient }, deps: { page, search, status } }) =>
        queryClient.ensureQueryData(
            ordersQueryOptions({ page, pageSize: PAGE_SIZE, search, status })
        ),
    component: OrdersPage,
});

const fmt = new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
});
const dateFmt = new Intl.DateTimeFormat("en-UG", { dateStyle: "medium" });

function OrdersPage() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();

    const [searchInput, setSearchInput] = useState(search.search);

    const debouncedSearch = useDebounce(searchInput, 500);

    useEffect(() => {
        setSearchInput(search.search);
    }, [search.search]);

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

    const { data } = useSuspenseQuery(
        ordersQueryOptions({
            page: search.page,
            pageSize: PAGE_SIZE,
            search: search.search,
            status: search.status,
        })
    );

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                        Orders
                    </h1>

                    <p className="mt-1 text-muted-foreground text-sm">
                        Manage sales orders from your customers.
                    </p>
                </div>

                <Link className={buttonVariants()} to="/orders/new">
                    New order
                </Link>
            </div>

            <div className="flex gap-3">
                <Input
                    aria-label="Search orders"
                    className="max-w-sm"
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by order number or customer…"
                    value={searchInput}
                />

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
                    <SelectTrigger
                        aria-label="Filter orders by status"
                        className="w-44"
                    >
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    
                    <SelectContent>
                        <SelectItem value="ALL">All statuses</SelectItem>
                        {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                                {s.charAt(0) + s.slice(1).toLowerCase()}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order no.</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Items</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.orders.length === 0 ? (
                        <TableRow>
                            <TableCell
                                className="py-8 text-center text-muted-foreground"
                                colSpan={6}
                            >
                                No orders found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>
                                    <Link
                                        className="font-medium hover:underline"
                                        params={{ orderId: order.id }}
                                        to="/orders/$orderId"
                                    >
                                        {order.orderNumber}
                                    </Link>
                                </TableCell>
                                <TableCell>{order.customer?.name}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            STATUS_VARIANT[order.status] ??
                                            "outline"
                                        }
                                    >
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {order._count.items}
                                </TableCell>
                                <TableCell className="text-right">
                                    {fmt.format(order.totalAmount)}
                                </TableCell>
                                <TableCell>
                                    {dateFmt.format(new Date(order.createdAt))}
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
