import { revalidateLogic } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import toast from "react-hot-toast";
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
import {
    type CreateProductInput,
    createProductSchema,
    PRODUCT_UNITS,
} from "#/features/products/schema";
import { useAppForm } from "#/hooks/use-form";
import { createProduct } from "../functions";

interface CreateProductFormProps {
    categories: {
        id: string;
        name: string;
        code: string;
    }[];
    suppliers: {
        id: string;
        name: string;
    }[];
}

export default function CreateProductForm({
    categories,
    suppliers,
}: CreateProductFormProps) {
    const router = useRouter();

    const defaultValues: CreateProductInput = {
        name: "",
        description: "",
        categoryId: "",
        supplierId: "",
        unit: "pcs",
        costPrice: 0,
        sellingPrice: 0,
        reorderPoint: 0,
        reorderQty: 0,
        imageUrl: "",
        isActive: true,
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                const normalizeSupplierId = value.supplierId?.trim()
                    ? value.supplierId.trim()
                    : null;

                await createProduct({
                    data: { ...value, supplierId: normalizeSupplierId },
                });

                toast.success("Product created successfully");
                router.navigate({ to: "/products", replace: true });
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(error.message);
                } else {
                    toast.error("Failed to create product");
                }
            }
        },
        validators: { onDynamic: createProductSchema },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Product details</CardTitle>
                <CardDescription>
                    Fill in the fields below. Required fields are name,
                    category, unit, cost price, and selling price.
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
                        <div className="grid gap-6 md:grid-cols-3">
                            <form.AppField name="name">
                                {(field) => (
                                    <field.FormInput
                                        label="Name"
                                        placeholder="Product name"
                                        type="text"
                                    />
                                )}
                            </form.AppField>

                            <form.AppField name="categoryId">
                                {(field) => (
                                    <field.FormSelect
                                        getOptionLabel={(c) => c.name}
                                        getOptionValue={(c) => c.id}
                                        label="Category"
                                        options={categories}
                                        placeholder="Select a category"
                                    />
                                )}
                            </form.AppField>

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

                            <form.AppField name="unit">
                                {(field) => (
                                    <field.FormSelect
                                        getOptionLabel={(u) => u.label}
                                        getOptionValue={(u) => u.value}
                                        label="Unit"
                                        options={PRODUCT_UNITS}
                                        placeholder="Select a unit"
                                    />
                                )}
                            </form.AppField>

                            <form.AppField name="imageUrl">
                                {(field) => (
                                    <field.FormInput
                                        label="Image URL"
                                        placeholder="https://example.com/image.jpg"
                                        type="url"
                                    />
                                )}
                            </form.AppField>
                        </div>

                        <Separator />

                        <div className="grid gap-6 md:grid-cols-3">
                            <form.AppField name="costPrice">
                                {(field) => (
                                    <field.FormNumberInput
                                        label="Cost price (UGX)"
                                        min="0"
                                        placeholder="0"
                                        step="0.01"
                                    />
                                )}
                            </form.AppField>

                            <form.AppField name="sellingPrice">
                                {(field) => (
                                    <field.FormNumberInput
                                        label="Selling price (UGX)"
                                        min="0"
                                        placeholder="0"
                                        step="0.01"
                                    />
                                )}
                            </form.AppField>

                            <form.AppField name="reorderPoint">
                                {(field) => (
                                    <field.FormNumberInput
                                        label="Reorder point"
                                        min="0"
                                        placeholder="1000"
                                        step="1"
                                    />
                                )}
                            </form.AppField>

                            <form.AppField name="reorderQty">
                                {(field) => (
                                    <field.FormNumberInput
                                        label="Reorder quantity"
                                        min="0"
                                        placeholder="0"
                                        step="1"
                                    />
                                )}
                            </form.AppField>

                            <form.AppField name="isActive">
                                {(field) => (
                                    <field.FormCheckbox label="Available for sale immediately." />
                                )}
                            </form.AppField>
                        </div>

                        <form.AppField name="description">
                            {(field) => (
                                <field.FormTextArea
                                    label="Description"
                                    placeholder="Add notes about the product, packaging, or specifications."
                                />
                            )}
                        </form.AppField>

                        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                            <Button
                                onClick={() => {
                                    form.reset();
                                }}
                                type="button"
                                variant="outline"
                            >
                                Reset
                            </Button>

                            <form.AppForm>
                                <form.SubmitButton label="Create product" />
                            </form.AppForm>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
