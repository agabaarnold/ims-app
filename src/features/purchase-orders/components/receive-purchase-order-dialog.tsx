import { revalidateLogic } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "#/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "#/components/ui/dialog";
import { FieldGroup } from "#/components/ui/field";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table";
import { useAppForm } from "#/hooks/use-form";
import { receivePurchaseOrder } from "../functions";
import {
    type ReceivePurchaseOrderInput,
    receivePurchaseOrderSchema,
} from "../schema";

interface PurchaseOrderItem {
    id: string;
    orderedQty: number;
    product: { id: string; name: string; sku: string; unit: string };
    receivedQty: number;
}

interface ReceivePurchaseOrderDialogProps {
    items: PurchaseOrderItem[];
    onOpenChange: (open: boolean) => void;
    open: boolean;
    purchaseOrderId: string;
    warehouses: { id: string; name: string }[];
}

export default function ReceivePurchaseOrderDialog({
    open,
    onOpenChange,
    purchaseOrderId,
    items,
    warehouses,
}: ReceivePurchaseOrderDialogProps) {
    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Receive stock</DialogTitle>
                    <DialogDescription>
                        Enter the quantity received for each line item.
                    </DialogDescription>
                </DialogHeader>

                {open && (
                    <ReceiveForm
                        items={items}
                        onDone={() => onOpenChange(false)}
                        purchaseOrderId={purchaseOrderId}
                        warehouses={warehouses}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function ReceiveForm({
    purchaseOrderId,
    items,
    warehouses,
    onDone,
}: {
    purchaseOrderId: string;
    items: PurchaseOrderItem[];
    warehouses: { id: string; name: string }[];
    onDone: () => void;
}) {
    const queryClient = useQueryClient();
    const openItems = items.filter(
        (item) => item.receivedQty < item.orderedQty
    );

    const defaultValues: ReceivePurchaseOrderInput = {
        id: purchaseOrderId,
        warehouseId: warehouses[0]?.id ?? "",
        lines: openItems.map((item) => ({
            purchaseOrderItemId: item.id,
            quantity: item.orderedQty - item.receivedQty,
        })),
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                const lines = value.lines.filter((line) => line.quantity > 0);
                if (lines.length === 0) {
                    toast.error(
                        "At least one line must have a quantity greater than 0"
                    );

                    return;
                }

                await receivePurchaseOrder({
                    data: {
                        ...value,
                        lines,
                    },
                });
                toast.success("Stock received");
                await queryClient.invalidateQueries({
                    queryKey: ["purchase-orders", purchaseOrderId],
                });
                await queryClient.invalidateQueries({
                    queryKey: ["purchase-orders"],
                }); 
                onDone();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to receive stock"
                );
            }
        },
        validators: { onDynamic: receivePurchaseOrderSchema },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    if (openItems.length === 0) {
        return (
            <p className="py-4 text-center text-muted-foreground text-sm">
                All line items on this purchase order are fully received.
            </p>
        );
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
            }}
        >
            <FieldGroup>
                <form.AppField name="warehouseId">
                    {(field) => (
                        <field.FormSelect
                            getOptionLabel={(w) => w.name}
                            getOptionValue={(w) => w.id}
                            label="Receiving warehouse"
                            options={warehouses}
                            placeholder="Select a warehouse"
                        />
                    )}
                </form.AppField>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">
                                Remaining
                            </TableHead>
                            <TableHead className="w-32">
                                Receiving now
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {openItems.map((item, index) => {
                            const remaining =
                                item.orderedQty - item.receivedQty;
                            return (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        {item.product.name}{" "}
                                        <span className="text-muted-foreground">
                                            ({item.product.sku})
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {remaining} {item.product.unit}
                                    </TableCell>
                                    <TableCell>
                                        <form.AppField
                                            name={`lines[${index}].quantity`}
                                        >
                                            {(field) => (
                                                <field.FormNumberInput
                                                    label=""
                                                    max={remaining.toString()}
                                                    min="0"
                                                    placeholder=""
                                                    step="1"
                                                />
                                            )}
                                        </form.AppField>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                <DialogFooter>
                    <Button onClick={onDone} type="button" variant="outline">
                        Cancel
                    </Button>
                    <form.AppForm>
                        <form.SubmitButton label="Receive stock" />
                    </form.AppForm>
                </DialogFooter>
            </FieldGroup>
        </form>
    );
}
