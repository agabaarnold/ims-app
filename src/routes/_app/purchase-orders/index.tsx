import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import PurchaseOrdersTable from "#/features/purchase-orders/components/purchase-orders-table";
import { purchaseOrdersQueryOptions } from "#/features/purchase-orders/functions/queries";

const purchaseOrdersSearchSchema = z.object({
    page: z.number().int().min(1).default(1),
    search: z.string().default(""),
    status: z
        .enum(["DRAFT", "SENT", "PARTIAL", "RECEIVED", "CANCELLED"])
        .optional(),
});

export const Route = createFileRoute("/_app/purchase-orders/")({
    validateSearch: purchaseOrdersSearchSchema,
    loaderDeps: ({ search }) => search,
    loader: ({ context: { queryClient }, deps: { page, search, status } }) =>
        queryClient.ensureQueryData(
            purchaseOrdersQueryOptions(page, search, status)
        ),
    component: PurchaseOrdersPage,
});

function PurchaseOrdersPage() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();

    const { data } = useSuspenseQuery(
        purchaseOrdersQueryOptions(search.page, search.search, search.status)
    );

    return (
        <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
            <div className="mb-6">
                <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                    Purchase orders
                </h1>
                <p className="mt-1 text-muted-foreground text-sm">
                    Order stock from your suppliers and receive it into your
                    warehouses.
                </p>
            </div>

            <PurchaseOrdersTable
                onPageChange={(page) =>
                    navigate({ search: (prev) => ({ ...prev, page }) })
                }
                onSearchChange={(value) =>
                    navigate({
                        search: (prev) => ({ ...prev, search: value, page: 1 }),
                    })
                }
                onStatusChange={(status) =>
                    navigate({
                        search: (prev) => ({ ...prev, status, page: 1 }),
                    })
                }
                page={data.page}
                pageCount={data.pageCount}
                purchaseOrders={data.purchaseOrders}
                search={search.search}
                status={search.status}
            />
        </div>
    );
}
