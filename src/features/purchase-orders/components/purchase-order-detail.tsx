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
import { formatCurrency, formatDate } from "#/lib/utils";
import { cancelPurchaseOrder, sendPurchaseOrder } from "../functions";
import ReceivePurchaseOrderDialog from "./receive-purchase-order-dialog";

interface PurchaseOrderDetailProps {
    purchaseOrder: {
        id: string;
        poNumber: string;
        status: string;
        totalAmount: number;
        expectedDate: Date | null;
        note: string | null;
        supplier: { id: string; name: string };
        createdBy: { id: string; name: string };
        items: {
            id: string;
            orderedQty: number;
            receivedQty: number;
            unitCost: number;
            product: { id: string; name: string; sku: string; unit: string };
        }[];
    };
    warehouses: { id: string; name: string }[];
}

export default function PurchaseOrderDetail({
    purchaseOrder,
    warehouses,
}: PurchaseOrderDetailProps) {
    const queryClient = useQueryClient();
    const [receiveOpen, setReceiveOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);

    const invalidate = () => {
        queryClient.invalidateQueries({
            queryKey: ["purchase-orders", purchaseOrder.id],
        });
        queryClient.invalidateQueries({
            queryKey: ["purchase-orders"],
        });
    };

    const handleSend = async () => {
        try {
            await sendPurchaseOrder({ data: { id: purchaseOrder.id } });
            toast.success("Purchase order sent");
            invalidate();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to send"
            );
        }
    };

    const handleCancel = async () => {
        try {
            await cancelPurchaseOrder({ data: { id: purchaseOrder.id } });
            toast.success("Purchase order cancelled");
            invalidate();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to cancel"
            );
        } finally {
            setCancelOpen(false);
        }
    };

    const canSend = purchaseOrder.status === "DRAFT";
    const canReceive =
        purchaseOrder.status === "SENT" || purchaseOrder.status === "PARTIAL";
    const canCancel =
        purchaseOrder.status === "DRAFT" ||
        purchaseOrder.status === "SENT" ||
        purchaseOrder.status === "PARTIAL";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="font-semibold text-2xl">
                        {purchaseOrder.poNumber}
                    </h1>
                    <Badge variant="outline">{purchaseOrder.status}</Badge>
                </div>
                <div className="flex gap-2">
                    {canSend && (
                        <Button onClick={handleSend} variant="outline">
                            Mark as sent
                        </Button>
                    )}
                    {canReceive && (
                        <Button onClick={() => setReceiveOpen(true)}>
                            Receive stock
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
                    <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Field
                            label="Supplier"
                            value={purchaseOrder.supplier.name}
                        />
                        <Field
                            label="Created by"
                            value={purchaseOrder.createdBy.name}
                        />
                        <Field
                            label="Total"
                            value={formatCurrency(purchaseOrder.totalAmount)}
                        />
                        <Field
                            label="Expected date"
                            value={
                                purchaseOrder.expectedDate
                                    ? formatDate(
                                          new Date(purchaseOrder.expectedDate)
                                      )
                                    : "—"
                            }
                        />
                    </dl>
                    {purchaseOrder.note && (
                        <p className="mt-6 text-muted-foreground text-sm">
                            {purchaseOrder.note}
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
                                    Ordered
                                </TableHead>
                                <TableHead className="text-right">
                                    Received
                                </TableHead>
                                <TableHead className="text-right">
                                    Unit cost
                                </TableHead>
                                <TableHead className="text-right">
                                    Line total
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchaseOrder.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        {item.product.name}{" "}
                                        <span className="text-muted-foreground">
                                            ({item.product.sku})
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.orderedQty} {item.product.unit}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.receivedQty} {item.product.unit}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(item.unitCost)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(
                                            item.unitCost * item.orderedQty
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ReceivePurchaseOrderDialog
                items={purchaseOrder.items}
                onOpenChange={setReceiveOpen}
                open={receiveOpen}
                purchaseOrderId={purchaseOrder.id}
                warehouses={warehouses}
            />

            <AlertDialog onOpenChange={setCancelOpen} open={cancelOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Cancel this purchase order?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This marks the order as cancelled. This can't be
                            undone.
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
