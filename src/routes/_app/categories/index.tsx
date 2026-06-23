import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import CategoriesTable from "#/features/categories/components/categories-table";
import { categoriesQueryOptions } from "#/features/categories/functions/queries";

export const Route = createFileRoute("/_app/categories/")({
    component: CategoriesPage,
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData(categoriesQueryOptions),
});

function CategoriesPage() {
    const { data: categories } = useSuspenseQuery(categoriesQueryOptions);

    return (
        <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
            <div className="mb-6">
                <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                    Categories
                </h1>

                <p className="mt-1 text-muted-foreground text-sm">
                    Organize your product catalog into categories and
                    subcategories.
                </p>
            </div>

            <CategoriesTable categories={categories} />
        </div>
    );
}
