import { IconPlus } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { z } from "zod";
import { buttonVariants } from "#/components/ui/button";
import { productColumns } from "#/features/products/components/product-columns";
import { ProductTable } from "#/features/products/components/product-table";
import { getProductsQuery } from "#/features/products/functions/queries";

export const Route = createFileRoute("/_app/products/")({
    component: ProductPage,
    loaderDeps: ({ search }) => ({
        page: search.page,
        pageSize: search.pageSize,
    }),
    loader: ({ context: { queryClient }, deps }) =>
        queryClient.ensureQueryData(
            getProductsQuery({
                page: deps.page,
                pageSize: deps.pageSize,
            })
        ),
    validateSearch: z.object({
        page: z.number().int().min(1).default(1).catch(1),
        pageSize: z.number().int().min(5).max(100).default(10).catch(10),
    }),
});

function ProductPage() {
    const { page, pageSize } = Route.useSearch();
    const {
        data: { products, total, pageCount },
    } = useSuspenseQuery(getProductsQuery({ page, pageSize }));

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-3xl">Products</h1>

                <Link
                    className={buttonVariants({
                        variant: "default",
                    })}
                    to="/products/new"
                >
                    <IconPlus /> <span>New Product</span>
                </Link>
            </div>

            <Suspense fallback={<div>Loading products...</div>}>
                <ProductTable
                    columns={productColumns}
                    data={products}
                    page={page}
                    pageCount={pageCount}
                    pageSize={pageSize}
                    total={total}
                />
            </Suspense>
        </div>
    );
}
