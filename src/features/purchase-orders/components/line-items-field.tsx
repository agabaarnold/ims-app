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
import { formatCurrency } from "#/lib/utils";
import type { CreatePurchaseOrderInput } from "../schema";

interface ProductOption {
    id: string;
    name: string;
    sku: string;
    unit: string;
}

// `form: any` is a placeholder — typing this properly needs the exact type your
// useAppForm hook exports for its form instance, which I haven't seen. If
// use-form.ts exports something like AppFormApi<T>, swap that in here.
interface LineItemsFieldProps {
    form: AppFormApi<CreatePurchaseOrderInput>;
    products: ProductOption[];
}

export default function LineItemsField({
    form,
    products,
}: LineItemsFieldProps) {
    return (
        <form.AppField mode="array" name="items">
            {(field) => (
                <div className="space-y-3">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="w-32">Quantity</TableHead>
                                <TableHead className="w-40">
                                    Unit cost (UGX)
                                </TableHead>
                                <TableHead className="w-28 text-right">
                                    Line total
                                </TableHead>
                                <TableHead className="w-0" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {field.state.value.map((_, index) => (
                                <LineItemRow
                                    form={form}
                                    index={index}
                                    // biome-ignore lint/suspicious/noArrayIndexKey: For simplicity
                                    key={index}
                                    onRemove={() => field.removeValue(index)}
                                    products={products}
                                />
                            ))}
                        </TableBody>
                    </Table>

                    {field.state.value.length === 0 && (
                        <p className="text-muted-foreground text-sm">
                            No line items yet. Add at least one product.
                        </p>
                    )}

                    <Button
                        onClick={() =>
                            field.pushValue({
                                productId: "",
                                orderedQty: 1,
                                unitCost: 0,
                            })
                        }
                        size="sm"
                        type="button"
                        variant="outline"
                    >
                        <IconPlus className="size-4" />
                        Add line item
                    </Button>
                </div>
            )}
        </form.AppField>
    );
}

function LineItemRow({
    form,
    index,
    products,
    onRemove,
}: {
    form: AppFormApi<CreatePurchaseOrderInput>;
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
                            placeholder="Select a product"
                        />
                    )}
                </form.AppField>
            </TableCell>
            <TableCell>
                <form.AppField name={`items[${index}].orderedQty`}>
                    {(field) => (
                        <field.FormNumberInput
                            label=""
                            min="1"
                            placeholder="1"
                            step="1"
                        />
                    )}
                </form.AppField>
            </TableCell>
            <TableCell>
                <form.AppField name={`items[${index}].unitCost`}>
                    {(field) => (
                        <field.FormNumberInput
                            label=""
                            min="0"
                            placeholder="0"
                            step="0.01"
                        />
                    )}
                </form.AppField>
            </TableCell>
            <TableCell className="text-right align-middle">
                <form.Subscribe<[number, number]>
                    selector={(state) => [
                        state.values.items[index]?.orderedQty,
                        state.values.items[index]?.unitCost,
                    ]}
                >
                    {([qty, cost]: [number, number]) =>
                        formatCurrency((qty || 0) * (cost || 0))
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
