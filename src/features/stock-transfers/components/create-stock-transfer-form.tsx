import { revalidateLogic } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import { Button } from "#/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { Separator } from "#/components/ui/separator";
import { useAppForm } from "#/hooks/use-form";
import { createStockTransfer } from "../functions";
import {
    type CreateStockTransferInput,
    createStockTransferSchema,
} from "../schema";
import TransferLineItemsField, {
    type ProductWithInventory,
} from "./transfer-line-items-field";

interface Warehouse {
    id: string;
    name: string;
}

interface CreateStockTransferFormProps {
    products: ProductWithInventory[];
    warehouses: Warehouse[];
}

export default function CreateStockTransferForm({
    warehouses,
    products,
}: CreateStockTransferFormProps) {
    const router = useRouter();

    const defaultValues: CreateStockTransferInput = {
        fromWarehouseId: "",
        toWarehouseId: "",
        items: [{ productId: "", quantity: 1 }],
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                const transfer = await createStockTransfer({ data: value });
                toast.success("Stock transfer created");
                router.navigate({
                    to: "/stock-transfers/$transferId",
                    params: { transferId: transfer.id },
                });
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to create transfer"
                );
            }
        },
        validators: { onDynamic: createStockTransferSchema },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transfer details</CardTitle>
                <CardDescription>
                    Select warehouses and add the products you want to move.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    <FieldGroup>
                        <div className="grid gap-6 md:grid-cols-2">
                            <form.AppField name="fromWarehouseId">
                                {(field) => (
                                    <field.FormSelect
                                        getOptionLabel={(w: Warehouse) =>
                                            w.name
                                        }
                                        getOptionValue={(w: Warehouse) => w.id}
                                        label="From warehouse"
                                        options={warehouses}
                                        placeholder="Source warehouse"
                                    />
                                )}
                            </form.AppField>

                            <form.AppField name="toWarehouseId">
                                {(field) => (
                                    <field.FormSelect
                                        getOptionLabel={(w: Warehouse) =>
                                            w.name
                                        }
                                        getOptionValue={(w: Warehouse) => w.id}
                                        label="To warehouse"
                                        options={warehouses}
                                        placeholder="Destination warehouse"
                                    />
                                )}
                            </form.AppField>
                        </div>

                        <Separator />

                        {/* Subscribe to fromWarehouseId so available-qty display
                            in line items updates reactively when the user changes source */}
                        <form.Subscribe
                            selector={(state) => state.values.fromWarehouseId}
                        >
                            {(fromWarehouseId) => (
                                <TransferLineItemsField
                                    form={form}
                                    fromWarehouseId={fromWarehouseId}
                                    products={products}
                                />
                            )}
                        </form.Subscribe>

                        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                            <Button
                                onClick={() =>
                                    router.navigate({ to: "/stock-transfers" })
                                }
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <form.AppForm>
                                <form.SubmitButton label="Create transfer" />
                            </form.AppForm>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
