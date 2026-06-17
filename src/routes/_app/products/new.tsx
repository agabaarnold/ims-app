import { IconArrowLeft, IconPackageImport } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { buttonVariants } from "#/components/ui/button";
import CreateProductForm from "#/features/products/components/create-product-form";
import { getProductFormData } from "#/features/products/functions";

export const Route = createFileRoute("/_app/products/new")({
    component: NewProductPage,
    loader: () => getProductFormData(),
});

function NewProductPage() {
    const { categories, suppliers } = Route.useLoaderData();

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

            <CreateProductForm categories={categories} suppliers={suppliers} />
        </div>
    );
}
