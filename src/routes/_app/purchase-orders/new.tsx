import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import CreatePurchaseOrderForm from "#/features/purchase-orders/components/create-purchase-order-form";
import { purchaseOrderFormDataQueryOptions } from "#/features/purchase-orders/functions/queries";

export const Route = createFileRoute("/_app/purchase-orders/new")({
    component: NewPurchaseOrderPage,
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData(purchaseOrderFormDataQueryOptions),
});

function NewPurchaseOrderPage() {
    const { data } = useSuspenseQuery(purchaseOrderFormDataQueryOptions);

    return (
        <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
            <div className="mb-6">
                <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                    New purchase order
                </h1>
                <p className="mt-1 text-muted-foreground text-sm">
                    Order stock from a supplier.
                </p>
            </div>

            <CreatePurchaseOrderForm
                products={data.products}
                suppliers={data.suppliers}
            />
        </div>
    );
}
