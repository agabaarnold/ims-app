import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import SuppliersTable from "#/features/suppliers/components/suppliers-table";
import { suppliersQueryOptions } from "#/features/suppliers/functions/queries";

const PAGE_SIZE = 10;

const suppliersSearchSchema = z.object({
    page: z.number().int().min(1).default(1),
    search: z.string().default(""),
});

export const Route = createFileRoute("/_app/suppliers/")({
    component: SuppliersPage,
    loaderDeps: ({ search }) => search,
    loader: ({ context: { queryClient }, deps: { page, search } }) =>
        queryClient.ensureQueryData(
            suppliersQueryOptions(page, search, PAGE_SIZE)
        ),
    validateSearch: suppliersSearchSchema,
});

function SuppliersPage() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();

    const { data } = useSuspenseQuery(
        suppliersQueryOptions(search.page, search.search, PAGE_SIZE)
    );

    return (
        <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
            <div className="mb-6">
                <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                    Suppliers
                </h1>
                <p className="mt-1 text-muted-foreground text-sm">
                    Manage the suppliers you order inventory from.
                </p>
            </div>

            <SuppliersTable
                onPageChange={(page) =>
                    navigate({ search: (prev) => ({ ...prev, page }) })
                }
                onSearchChange={(value) =>
                    navigate({
                        search: (prev) => ({ ...prev, search: value, page: 1 }),
                    })
                }
                page={data.page}
                pageCount={data.pageCount}
                search={search.search}
                suppliers={data.suppliers}
            />
        </div>
    );
}
