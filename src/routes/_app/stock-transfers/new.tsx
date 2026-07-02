import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import CreateStockTransferForm from "#/features/stock-transfers/components/create-stock-transfer-form";
import { stockTransferFormDataQueryOptions } from "#/features/stock-transfers/functions/queries";

export const Route = createFileRoute("/_app/stock-transfers/new")({
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData(
            stockTransferFormDataQueryOptions({ page: 1, pageSize: 50 })
        ),
    component: NewStockTransferPage,
});

function NewStockTransferPage() {
    const { data } = useSuspenseQuery(
        stockTransferFormDataQueryOptions({ page: 1, pageSize: 50 })
    );

    return (
        <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
            <div className="mb-6">
                <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                    New stock transfer
                </h1>
                <p className="mt-1 text-muted-foreground text-sm">
                    Move products from one warehouse to another.
                </p>
            </div>

            <CreateStockTransferForm
                products={data.products}
                warehouses={data.warehouses}
            />
        </div>
    );
}
