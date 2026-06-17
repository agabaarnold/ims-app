import { IconArrowLeft, IconPackageImport } from "@tabler/icons-react";
import { revalidateLogic } from "@tanstack/react-form";
import { Link, useRouter } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { Button, buttonVariants } from "#/components/ui/button";
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
                await createProduct({ data: { ...value } });
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
        validators: { onSubmit: createProductSchema },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    return (
        <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                        <IconPackageImport className="size-5" />
                        <span className="text-sm">Products</span>
                    </div>
                    <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                        Create new product
                    </h1>
                    <p className="mt-1 text-muted-foreground text-sm">
                        Add a product to your inventory catalog.
                    </p>
                </div>

                <Link
                    className={buttonVariants({ variant: "outline" })}
                    to="/products"
                >
                    <IconArrowLeft className="mr-2 size-4" />
                    Back
                </Link>
            </div>

            <Card className="">
                <CardHeader>
                    <CardTitle>Product details</CardTitle>
                    <CardDescription>
                        Fill in the fields below. Required fields are SKU, name,
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

                                {/* TODO: This should be a dropdown */}
                                <form.AppField name="unit">
                                    {(field) => (
                                        <field.FormInput
                                            label="Unit"
                                            placeholder="pcs"
                                            type="text"
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

                            <form.AppField name="name">
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
        </div>
    );
}
