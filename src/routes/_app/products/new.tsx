import { createFileRoute } from "@tanstack/react-router";
import CreateProductForm from "#/features/products/components/create-product-form";
import { getProductFormData } from "#/features/products/functions";

export const Route = createFileRoute("/_app/products/new")({
    component: NewProductPage,
    loader: () => getProductFormData(),
});

function NewProductPage() {
    const { categories, suppliers } = Route.useLoaderData();

    return (
        <div>
            <CreateProductForm categories={categories} suppliers={suppliers} />
        </div>
    );
}
