import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "#/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table";
import type { AppFormApi } from "#/hooks/use-form";
import type { CreateStockTransferInput } from "../schema";

export interface ProductWithInventory {
    id: string;
    inventoryItems: {
        warehouseId: string;
        quantity: number;
        reservedQuantity: number;
    }[];
    name: string;
    sku: string;
    unit: string;
}

function getAvailableQty(
    product: ProductWithInventory,
    fromWarehouseId: string
): number {
    const item = product.inventoryItems.find(
        (i) => i.warehouseId === fromWarehouseId
    );
    return item ? Math.max(0, item.quantity - item.reservedQuantity) : 0;
}

interface TransferLineItemsFieldProps {
    form: AppFormApi<CreateStockTransferInput>;
    fromWarehouseId: string;
    products: ProductWithInventory[];
}

export default function TransferLineItemsField({
    form,
    products,
    fromWarehouseId,
}: TransferLineItemsFieldProps) {
    return (
        <form.AppField mode="array" name="items">
            {(itemsField) => (
                <div className="space-y-3">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="w-40 text-right">
                                    Available in source
                                </TableHead>
                                <TableHead className="w-36">
                                    Qty to transfer
                                </TableHead>
                                <TableHead className="w-0" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {itemsField.state.value.map(
                                (_: unknown, index: number) => (
                                    <TransferLineItemRow
                                        form={form}
                                        fromWarehouseId={fromWarehouseId}
                                        index={index}
                                        // biome-ignore lint/suspicious/noArrayIndexKey: For simplicity
                                        key={index}
                                        onRemove={() =>
                                            itemsField.removeValue(index)
                                        }
                                        products={products}
                                    />
                                )
                            )}
                        </TableBody>
                    </Table>

                    {itemsField.state.value.length === 0 && (
                        <p className="text-muted-foreground text-sm">
                            No items yet. Add at least one product to transfer.
                        </p>
                    )}

                    <Button
                        onClick={() =>
                            itemsField.pushValue({ productId: "", quantity: 1 })
                        }
                        size="sm"
                        type="button"
                        variant="outline"
                    >
                        <IconPlus className="size-4" />
                        Add item
                    </Button>
                </div>
            )}
        </form.AppField>
    );
}

function TransferLineItemRow({
    form,
    index,
    products,
    fromWarehouseId,
    onRemove,
}: {
    form: AppFormApi<CreateStockTransferInput>;
    index: number;
    products: ProductWithInventory[];
    fromWarehouseId: string;
    onRemove: () => void;
}) {
    return (
        <TableRow>
            <TableCell>
                <form.AppField name={`items[${index}].productId`}>
                    {(field) => (
                        <field.FormSelect
                            getOptionLabel={(p: ProductWithInventory) =>
                                `${p.name} (${p.sku})`
                            }
                            getOptionValue={(p: ProductWithInventory) => p.id}
                            label=""
                            options={products}
                            placeholder="Select a product"
                        />
                    )}
                </form.AppField>
            </TableCell>
            <TableCell className="text-right align-middle">
                <form.Subscribe<string>
                    selector={(state) => state.values.items[index]?.productId}
                >
                    {(productId) => {
                        if (!(productId && fromWarehouseId)) {
                            return "—";
                        }

                        const product = products.find(
                            (p) => p.id === productId
                        );
                        if (!product) {
                            return "—";
                        }

                        const usedElsewhere = form.state.values.items.reduce(
                            (sum, item, i) =>
                                i !== index && item.productId === productId
                                    ? sum + (item.quantity || 0)
                                    : sum,
                            0
                        );

                        const available = Math.max(
                            0,
                            getAvailableQty(product, fromWarehouseId) -
                                usedElsewhere
                        );

                        return (
                            <span
                                className={
                                    available === 0
                                        ? "text-destructive"
                                        : "text-muted-foreground"
                                }
                            >
                                {available} {product.unit}
                            </span>
                        );
                    }}
                </form.Subscribe>
            </TableCell>
            <TableCell>
                <form.AppField name={`items[${index}].quantity`}>
                    {(field) => (
                        <field.FormNumberInput
                            label=""
                            min="1"
                            placeholder=""
                            step="1"
                        />
                    )}
                </form.AppField>
            </TableCell>
            <TableCell>
                <Button
                    aria-label="Remove item"
                    onClick={onRemove}
                    size="icon"
                    type="button"
                    variant="ghost"
                >
                    <IconTrash className="size-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
}
