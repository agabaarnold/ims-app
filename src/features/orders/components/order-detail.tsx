import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-hot-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table";
import { advanceOrderStatus, cancelOrder, type getOrder } from "../functions";
import { CANCELLABLE_STATUSES, NEXT_STATUS, type OrderStatus } from "../schema";
import ConfirmOrderDialog from "./confirm-order-dialog";

const fmt = new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
});

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

const ADVANCE_LABEL: Partial<Record<OrderStatus, string>> = {
    CONFIRMED: "Start picking",
    PICKING: "Mark as shipped",
    SHIPPED: "Mark as delivered",
};

type Order = Awaited<ReturnType<typeof getOrder>>;

interface OrderDetailProps {
    order: Order;
    warehouses: { id: string; name: string }[];
}

export default function OrderDetail({ order, warehouses }: OrderDetailProps) {
    const queryClient = useQueryClient();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);

    const status = order.status as OrderStatus;
    const nextStatus = NEXT_STATUS[status];
    const advanceLabel = ADVANCE_LABEL[status];
    const canCancel = CANCELLABLE_STATUSES.has(status);

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["orders", order.id] });

    const handleAdvance = async () => {
        try {
            await advanceOrderStatus({ data: { id: order.id } });
            toast.success(`Order moved to ${nextStatus}`);
            invalidate();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update status"
            );
        }
    };

    const handleCancel = async () => {
        try {
            await cancelOrder({ data: { id: order.id } });
            toast.success("Order cancelled");
            invalidate();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to cancel"
            );
        } finally {
            setCancelOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="font-semibold text-2xl">
                            {order.orderNumber}
                        </h1>
                        <Badge
                            variant={STATUS_VARIANT[order.status] ?? "outline"}
                        >
                            {order.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Created {dateFmt.format(new Date(order.createdAt))} by{" "}
                        {order.createdBy.name}
                    </p>
                </div>

                <div className="flex gap-2">
                    {status === "PENDING" && (
                        <Button onClick={() => setConfirmOpen(true)}>
                            Confirm order
                        </Button>
                    )}
                    {advanceLabel && nextStatus && (
                        <Button onClick={handleAdvance} variant="outline">
                            {advanceLabel}
                        </Button>
                    )}
                    {canCancel && (
                        <Button
                            onClick={() => setCancelOpen(true)}
                            variant="outline"
                        >
                            Cancel order
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                </CardHeader>

                <CardContent>
                    <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <Field
                            label="Customer"
                            value={order.customer?.name ?? "—"}
                        />
                        <Field
                            label="Customer email"
                            value={order.customer?.email ?? "—"}
                        />
                        <Field
                            label="Order total"
                            value={fmt.format(order.totalAmount)}
                        />
                    </dl>
                    {order.note && (
                        <p className="mt-6 text-muted-foreground text-sm">
                            {order.note}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Line items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">
                                    Qty
                                </TableHead>
                                <TableHead className="text-right">
                                    Unit price
                                </TableHead>
                                <TableHead className="text-right">
                                    Discount
                                </TableHead>
                                <TableHead className="text-right">
                                    Line total
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map((item) => {
                                const total =
                                    item.quantity *
                                    item.unitPrice *
                                    (1 - item.discount / 100);
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            {item.product.name}{" "}
                                            <span className="text-muted-foreground">
                                                ({item.product.sku})
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.quantity} {item.product.unit}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {fmt.format(item.unitPrice)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.discount > 0
                                                ? `${item.discount}%`
                                                : "—"}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {fmt.format(total)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ConfirmOrderDialog
                onOpenChange={setConfirmOpen}
                open={confirmOpen}
                orderId={order.id}
                warehouses={warehouses}
            />

            <AlertDialog onOpenChange={setCancelOpen} open={cancelOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {CANCELLABLE_STATUSES.has(status) &&
                            status !== "PENDING"
                                ? "This order has already been confirmed — cancelling will restore the stock that was decremented."
                                : "This order will be marked as cancelled."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep order</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel}>
                            Cancel order
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="font-medium text-muted-foreground text-xs uppercase">
                {label}
            </dt>
            <dd className="mt-1 font-medium text-sm">{value}</dd>
        </div>
    );
}
