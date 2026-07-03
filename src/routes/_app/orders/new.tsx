import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import CreateOrderForm from "#/features/orders/components/create-order-form";
import { orderFormDataQueryOptions } from "#/features/orders/functions/queries";

export const Route = createFileRoute("/_app/orders/new")({
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData(orderFormDataQueryOptions),
    component: NewOrderPage,
});

function NewOrderPage() {
    const { data } = useSuspenseQuery(orderFormDataQueryOptions);

    return (
        <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
            <div className="mb-6">
                <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                    New order
                </h1>

                <p className="mt-1 text-muted-foreground text-sm">
                    Create a sales order for a customer.
                </p>
            </div>

            <CreateOrderForm
                customers={data.customers}
                products={data.products}
            />
        </div>
    );
}
