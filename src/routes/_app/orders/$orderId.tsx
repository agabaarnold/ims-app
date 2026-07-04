import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { buttonVariants } from "#/components/ui/button";
import OrderDetail from "#/features/orders/components/order-detail";
import {
    orderFormDataQueryOptions,
    orderQueryOptions,
} from "#/features/orders/functions/queries";

export const Route = createFileRoute("/_app/orders/$orderId")({
    loader: ({ context: { queryClient }, params: { orderId } }) =>
        Promise.all([
            queryClient.ensureQueryData(orderQueryOptions(orderId)),
            queryClient.ensureQueryData(orderFormDataQueryOptions()),
        ]),
    component: OrderDetailPage,
});

function OrderDetailPage() {
    const { orderId } = Route.useParams();
    const { data: order } = useSuspenseQuery(orderQueryOptions(orderId));
    const { data: formData } = useSuspenseQuery(orderFormDataQueryOptions());

    return (
        <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
            <div className="mb-6">
                <Link
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                    to="/orders"
                >
                    ← Back to orders
                </Link>
            </div>

            <OrderDetail order={order} warehouses={formData.warehouses} />
        </div>
    );
}
