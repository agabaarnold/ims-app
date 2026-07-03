import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import CustomersTable from "#/features/customers/components/customers-table";
import { customersQueryOptions } from "#/features/customers/functions/queries";

const PAGE_SIZE = 10;

const searchSchema = z.object({
    page: z.number().int().min(1).default(1),
    search: z.string().default(""),
});

export const Route = createFileRoute("/_app/customers/")({
    validateSearch: searchSchema,
    loaderDeps: ({ search }) => search,
    loader: ({ context: { queryClient }, deps: { page, search } }) =>
        queryClient.ensureQueryData(
            customersQueryOptions({ page, pageSize: PAGE_SIZE, search })
        ),
    component: CustomersPage,
});

function CustomersPage() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    const { data } = useSuspenseQuery(
        customersQueryOptions({
            page: search.page,
            pageSize: PAGE_SIZE,
            search: search.search,
        })
    );

    return (
        <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
            <div className="mb-6">
                <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                    Customers
                </h1>
                <p className="mt-1 text-muted-foreground text-sm">
                    Manage the customers you sell to.
                </p>
            </div>
            <CustomersTable
                customers={data.customers}
                onPageChange={(p) =>
                    navigate({ search: (prev) => ({ ...prev, page: p }) })
                }
                onSearchChange={(s) =>
                    navigate({
                        search: (prev) => ({ ...prev, search: s, page: 1 }),
                    })
                }
                page={data.page}
                pageCount={data.pageCount}
                search={search.search}
            />
        </div>
    );
}
