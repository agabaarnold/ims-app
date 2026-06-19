import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import ProductCard from "#/features/products/components/product-card";
import { productDetailQueryOptions } from "#/features/products/functions/queries";

export const Route = createFileRoute("/_app/products/$productId/")({
    component: ProductDetailPage,
    loader: ({ context: { queryClient }, params: { productId } }) =>
        queryClient.ensureQueryData(productDetailQueryOptions(productId)),
});

function ProductDetailPage() {
    const { productId } = Route.useParams();

    const { data: product } = useSuspenseQuery(
        productDetailQueryOptions(productId)
    );

    return (
        <div className="">
            <ProductCard product={product} />
        </div>
    );
}
