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
import { cancelStockTransfer, completeStockTransfer } from "../functions";

const STATUS_VARIANT: Record<
    string,
    "default" | "secondary" | "outline" | "destructive"
> = {
    PENDING: "secondary",
    COMPLETED: "default",
    CANCELLED: "destructive",
};

interface StockTransferDetailProps {
    transfer: {
        id: string;
        status: string;
        createdAt: Date;
        completedAt: Date | null;
        fromWarehouse: { id: string; name: string };
        toWarehouse: { id: string; name: string };
        createdBy: { id: string; name: string };
        items: {
            id: string;
            quantity: number;
            product: { id: string; name: string; sku: string; unit: string };
        }[];
    };
}

export default function StockTransferDetail({
    transfer,
}: StockTransferDetailProps) {
    const queryClient = useQueryClient();
    const [completeOpen, setCompleteOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);

    const invalidate = () =>
        queryClient.invalidateQueries({
            queryKey: ["stock-transfers"],
        });

    const handleComplete = async () => {
        try {
            await completeStockTransfer({ data: { id: transfer.id } });
            toast.success("Transfer completed — stock moved");
            await invalidate();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to complete transfer"
            );
        } finally {
            setCompleteOpen(false);
        }
    };

    const handleCancel = async () => {
        try {
            await cancelStockTransfer({ data: { id: transfer.id } });
            toast.success("Transfer cancelled");
            await invalidate();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to cancel transfer"
            );
        } finally {
            setCancelOpen(false);
        }
    };

    const isPending = transfer.status === "PENDING";

    const fmt = new Intl.DateTimeFormat("en-UG", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="font-semibold text-2xl">Stock transfer</h1>
                    <Badge
                        variant={STATUS_VARIANT[transfer.status] ?? "outline"}
                    >
                        {transfer.status}
                    </Badge>
                </div>
                {isPending && (
                    <div className="flex gap-2">
                        <Button onClick={() => setCompleteOpen(true)}>
                            Complete transfer
                        </Button>
                        <Button
                            onClick={() => setCancelOpen(true)}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <Field
                            label="From"
                            value={transfer.fromWarehouse.name}
                        />
                        <Field label="To" value={transfer.toWarehouse.name} />
                        <Field
                            label="Created by"
                            value={transfer.createdBy.name}
                        />
                        <Field
                            label="Created at"
                            value={fmt.format(new Date(transfer.createdAt))}
                        />
                        {transfer.completedAt && (
                            <Field
                                label="Completed at"
                                value={fmt.format(
                                    new Date(transfer.completedAt)
                                )}
                            />
                        )}
                    </dl>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-right">
                                    Quantity
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transfer.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.product.name}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {item.product.sku}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.quantity} {item.product.unit}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog onOpenChange={setCompleteOpen} open={completeOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Complete this transfer?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will immediately move stock from{" "}
                            <strong>{transfer.fromWarehouse.name}</strong> to{" "}
                            <strong>{transfer.toWarehouse.name}</strong>. This
                            can't be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Go back</AlertDialogCancel>
                        <AlertDialogAction onClick={handleComplete}>
                            Complete transfer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog onOpenChange={setCancelOpen} open={cancelOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Cancel this transfer?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This marks the transfer as cancelled. No stock will
                            be moved. This can't be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Go back</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel}>
                            Cancel transfer
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
