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
import { createOrder } from "../functions";
import { type CreateOrderInput, createOrderSchema } from "../schema";
import OrderLineItemsField, {
    type ProductOption,
} from "./order-line-items-field";

interface CreateOrderFormProps {
    customers: { id: string; name: string }[];
    products: ProductOption[];
}

export default function CreateOrderForm({
    customers,
    products,
}: CreateOrderFormProps) {
    const router = useRouter();

    const defaultValues: CreateOrderInput = {
        customerId: "",
        note: "",
        items: [{ productId: "", quantity: 1, unitPrice: 0, discount: 0 }],
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                const order = await createOrder({
                    data: {
                        ...value,
                        note: value.note?.trim() || null,
                    },
                });
                toast.success(`Order ${order.orderNumber} created`);
                router.navigate({
                    to: "/orders/$orderId",
                    params: { orderId: order.id },
                });
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to create order"
                );
            }
        },
        validators: { onDynamic: createOrderSchema },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order details</CardTitle>

                <CardDescription>
                    Select a customer and add the products being ordered.
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
                            <form.AppField name="customerId">
                                {(field) => (
                                    <field.FormSelect
                                        getOptionLabel={(c) => c.name}
                                        getOptionValue={(c) => c.id}
                                        label="Customer"
                                        options={customers}
                                        placeholder="Select a customer"
                                    />
                                )}
                            </form.AppField>
                        </div>

                        <Separator />

                        <OrderLineItemsField form={form} products={products} />

                        <Separator />

                        <form.AppField name="note">
                            {(field) => (
                                <field.FormTextArea
                                    label="Note"
                                    placeholder="Delivery instructions, special requests, etc."
                                />
                            )}
                        </form.AppField>

                        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                            <Button
                                onClick={() =>
                                    router.navigate({ to: "/orders" })
                                }
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>

                            <form.AppForm>
                                <form.SubmitButton label="Create order" />
                            </form.AppForm>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
