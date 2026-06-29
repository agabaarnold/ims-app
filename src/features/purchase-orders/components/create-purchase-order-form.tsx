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
import { createPurchaseOrder } from "../functions";
import {
    type CreatePurchaseOrderInput,
    createPurchaseOrderSchema,
} from "../schema";
import LineItemsField from "./line-items-field";

interface CreatePurchaseOrderFormProps {
    products: { id: string; name: string; sku: string; unit: string }[];
    suppliers: { id: string; name: string }[];
}

export default function CreatePurchaseOrderForm({
    suppliers,
    products,
}: CreatePurchaseOrderFormProps) {
    const router = useRouter();

    const defaultValues: CreatePurchaseOrderInput = {
        supplierId: "",
        expectedDate: "",
        note: "",
        items: [{ productId: "", orderedQty: 1, unitCost: 0 }],
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                const payload = {
                    ...value,
                    expectedDate: value.expectedDate?.trim() || null,
                    note: value.note?.trim() || null,
                };
                const po = await createPurchaseOrder({ data: payload });
                toast.success(`Purchase order ${po.poNumber} created`);
                router.navigate({
                    to: "/purchase-orders/$poId",
                    params: { poId: po.id },
                });
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to create purchase order"
                );
            }
        },
        validators: { onDynamic: createPurchaseOrderSchema },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Purchase order details</CardTitle>
                <CardDescription>
                    Select a supplier and add the products you're ordering.
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
                            <form.AppField name="supplierId">
                                {(field) => (
                                    <field.FormSelect
                                        getOptionLabel={(s) => s.name}
                                        getOptionValue={(s) => s.id}
                                        label="Supplier"
                                        options={suppliers}
                                        placeholder="Select a supplier"
                                    />
                                )}
                            </form.AppField>

                            <form.AppField name="expectedDate">
                                {(field) => (
                                    <field.FormInput
                                        label="Expected date"
                                        type="date"
                                    />
                                )}
                            </form.AppField>
                        </div>

                        <Separator />

                        <LineItemsField form={form} products={products} />

                        <Separator />

                        <form.AppField name="note">
                            {(field) => (
                                <field.FormTextArea
                                    label="Note"
                                    placeholder="Delivery instructions, payment terms, etc."
                                />
                            )}
                        </form.AppField>

                        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                            <Button
                                onClick={() =>
                                    router.navigate({ to: "/purchase-orders" })
                                }
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <form.AppForm>
                                <form.SubmitButton label="Create purchase order" />
                            </form.AppForm>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
