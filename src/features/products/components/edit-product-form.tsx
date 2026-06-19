import { revalidateLogic } from "@tanstack/react-form";
import { useParams, useRouter } from "@tanstack/react-router";
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
import { type getProductDetails, updateProduct } from "../functions";
import {
    PRODUCT_UNITS,
    type UpdateProductInput,
    updateProductSchema,
} from "../schema";

interface EditProductFormProps {
    categories: { id: string; name: string; code: string }[];
    product: Awaited<ReturnType<typeof getProductDetails>>;
    suppliers: { id: string; name: string }[];
}

export default function EditProductForm({
    product,
    categories,
    suppliers,
}: EditProductFormProps) {
    const router = useRouter();
    const { productId } = useParams({ from: "/_app/products/$productId/edit" });

    const defaultValues: UpdateProductInput = {
        id: product.id,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
        unit: product.unit,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        reorderPoint: product.reorderPoint,
        reorderQty: product.reorderQty,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                const normalizeSupplierId = value.supplierId?.trim() || null;
                const imageUrl = value.imageUrl?.trim() || null;
                
                await updateProduct({
                    data: {
                        ...value,
                        imageUrl,
                        supplierId: normalizeSupplierId,
                    },
                });
                toast.success("Product updated");
                router.navigate({
                    to: "/products/$productId",
                    params: { productId },
                    replace: true,
                });
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to update product"
                );
            }
        },
        validators: { onDynamic: updateProductSchema },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Product update</CardTitle>
                <CardDescription>
                    Use the form below to update the product
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
                                <form.SubmitButton label="Update product" />
                            </form.AppForm>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
