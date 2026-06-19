import { IconArchive, IconArrowLeft, IconPencil } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { z } from "zod";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import ProductCard from "#/features/products/components/product-card";
import ProductTabs from "#/features/products/components/product-tabs";
import { archiveProduct } from "#/features/products/functions";
import { productDetailQueryOptions } from "#/features/products/functions/queries";

const productDetailSearchSchema = z.object({
    tab: z.enum(["stock", "movements", "audit"]).default("stock"),
    movementsPage: z.number().int().min(1).default(1),
    auditPage: z.number().int().min(1).default(1),
});

export const Route = createFileRoute("/_app/products/$productId/")({
    component: ProductDetailPage,
    loader: ({ context: { queryClient }, params: { productId } }) =>
        queryClient.ensureQueryData(productDetailQueryOptions(productId)),
    validateSearch: productDetailSearchSchema,
});

function ProductDetailPage() {
    const { productId } = Route.useParams();
    const search = Route.useSearch();
    const navigate = useNavigate();

    const { data: product } = useSuspenseQuery(
        productDetailQueryOptions(productId)
    );

    const handleArchive = async () => {
        try {
            await archiveProduct({ data: { id: product.id } });
            toast.success("Product archived");
            await navigate({ to: "/products" });
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to archive product"
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link
                        className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
                        to="/products"
                    >
                        <IconArrowLeft className="size-4" />
                        Back to products
                    </Link>

                    <div className="flex items-center gap-3">
                        <h1 className="font-semibold text-2xl">
                            {product.name}
                        </h1>

                        <Badge variant="outline">{product.sku}</Badge>

                        <Badge
                            variant={product.isActive ? "default" : "secondary"}
                        >
                            {product.isActive ? "Active" : "Archived"}
                        </Badge>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        render={
                            <Link
                                params={{ productId }}
                                to="/products/$productId/edit"
                            >
                                <IconPencil className="size-4" />
                                Edit
                            </Link>
                        }
                        variant="outline"
                    />

                    {product.isActive && (
                        <Button onClick={handleArchive} variant="outline">
                            <IconArchive className="size-4" />
                            Archive
                        </Button>
                    )}
                </div>
            </div>

            <ProductCard product={product} />

            <ProductTabs product={product} search={search} />
        </div>
    );
}
