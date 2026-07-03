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
import type { CreateOrderInput } from "../schema";

export interface ProductOption {
    id: string;
    name: string;
    sellingPrice: number;
    sku: string;
    unit: string;
}

interface OrderLineItemsFieldProps {
    form: AppFormApi<CreateOrderInput>;
    products: ProductOption[];
}

const fmt = new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
});

function lineTotal(qty: number, price: number, discount: number): number {
    return qty * price * (1 - discount / 100);
}

export default function OrderLineItemsField({
    form,
    products,
}: OrderLineItemsFieldProps) {
    return (
        <div className="space-y-3">
            <form.AppField mode="array" name="items">
                {(itemsField) => (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="w-24">Qty</TableHead>
                                    <TableHead className="w-40">
                                        Unit price (UGX)
                                    </TableHead>
                                    <TableHead className="w-28">
                                        Discount %
                                    </TableHead>
                                    <TableHead className="w-36 text-right">
                                        Line total
                                    </TableHead>
                                    <TableHead className="w-0" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itemsField.state.value.map(
                                    (_: unknown, index: number) => (
                                        <OrderLineItemRow
                                            form={form}
                                            index={index}
                                            // biome-ignore lint/suspicious/noArrayIndexKey: We are using the index as a key here because the order of items is not expected to change, and we want to avoid unnecessary re-renders when the array changes.
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
                                No items yet. Add at least one product.
                            </p>
                        )}

                        <Button
                            onClick={() =>
                                itemsField.pushValue({
                                    productId: "",
                                    quantity: 1,
                                    unitPrice: 0,
                                    discount: 0,
                                })
                            }
                            size="sm"
                            type="button"
                            variant="outline"
                        >
                            <IconPlus className="size-4" />
                            Add line item
                        </Button>
                    </>
                )}
            </form.AppField>

            {/* Grand total — subscribes to full items array (unavoidable) but
                isolated to this small node so re-renders are cheap */}
            <div className="flex justify-end border-t pt-4">
                <form.Subscribe<number>
                    selector={(state) =>
                        (state.values.items ?? []).reduce(
                            (sum: number, item) =>
                                sum +
                                lineTotal(
                                    item?.quantity ?? 0,
                                    item?.unitPrice ?? 0,
                                    item?.discount ?? 0
                                ),
                            0
                        )
                    }
                >
                    {(total) => (
                        <p className="font-medium text-sm">
                            Order total:{" "}
                            <span className="text-base">
                                {fmt.format(total)}
                            </span>
                        </p>
                    )}
                </form.Subscribe>
            </div>
        </div>
    );
}

function OrderLineItemRow({
    form,
    index,
    products,
    onRemove,
}: {
    form: AppFormApi<CreateOrderInput>;
    index: number;
    products: ProductOption[];
    onRemove: () => void;
}) {
    return (
        <TableRow>
            <TableCell>
                <form.AppField name={`items[${index}].productId`}>
                    {(field) => (
                        <field.FormSelect
                            getOptionLabel={(p: ProductOption) =>
                                `${p.name} (${p.sku})`
                            }
                            getOptionValue={(p: ProductOption) => p.id}
                            label=""
                            options={products}
                            placeholder="Select product"
                        />
                    )}
                </form.AppField>
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
                <form.AppField name={`items[${index}].unitPrice`}>
                    {(field) => (
                        <field.FormNumberInput
                            label=""
                            min="0"
                            placeholder=""
                            step="0.01"
                        />
                    )}
                </form.AppField>
            </TableCell>
            <TableCell>
                <form.AppField name={`items[${index}].discount`}>
                    {(field) => (
                        <field.FormNumberInput
                            label=""
                            max="100"
                            min="0"
                            placeholder=""
                            step="0.01"
                        />
                    )}
                </form.AppField>
            </TableCell>
            <TableCell className="text-right align-middle">
                {/* Scalar tuple selector — only re-renders this cell when
                    qty/price/discount for this specific row changes */}
                <form.Subscribe<number[]>
                    selector={(state) => {
                        const item = state.values.items?.[index];
                        return [
                            item?.quantity ?? 0,
                            item?.unitPrice ?? 0,
                            item?.discount ?? 0,
                        ];
                    }}
                >
                    {([qty, price, disc]) =>
                        fmt.format(lineTotal(qty, price, disc))
                    }
                </form.Subscribe>
            </TableCell>
            <TableCell>
                <Button
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
