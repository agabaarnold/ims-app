import { IconArrowLeft, IconPackage } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { buttonVariants } from "#/components/ui/button";
import EditProductForm from "#/features/products/components/edit-product-form";
import {
    productDetailQueryOptions,
    productFormDataQueryOptions,
} from "#/features/products/functions/queries";

export const Route = createFileRoute("/_app/products/$productId/edit")({
    component: EditProductPage,
    loader: ({ context: { queryClient }, params: { productId } }) =>
        Promise.all([
            queryClient.ensureQueryData(productDetailQueryOptions(productId)),
            queryClient.ensureQueryData(productFormDataQueryOptions),
        ]),
});

function EditProductPage() {
    const { productId } = Route.useParams();

    const { data: product } = useSuspenseQuery(
        productDetailQueryOptions(productId)
    );
    const {
        data: { categories, suppliers },
    } = useSuspenseQuery(productFormDataQueryOptions);

    return (
        <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                        <IconPackage className="size-5" />
                        <span className="text-sm">{product.name}</span>
                    </div>
                    <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                        Edit product
                    </h1>
                    <p className="mt-1 text-muted-foreground text-sm">
                        Edit a product in your inventory catalog.
                    </p>
                </div>

                <Link
                    className={buttonVariants({ variant: "outline" })}
                    to=".."
                >
                    <IconArrowLeft className="mr-2 size-4" />
                    Back
                </Link>
            </div>

            <EditProductForm
                categories={categories}
                product={product}
                suppliers={suppliers}
            />
        </div>
    );
}
