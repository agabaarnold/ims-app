import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import PurchaseOrderDetail from "#/features/purchase-orders/components/purchase-order-detail";
import {
    purchaseOrderFormDataQueryOptions,
    purchaseOrderQueryOptions,
} from "#/features/purchase-orders/functions/queries";

export const Route = createFileRoute("/_app/purchase-orders/$poId/")({
    component: PurchaseOrderDetailPage,
    loader: ({ context: { queryClient }, params: { poId } }) =>
        Promise.all([
            queryClient.ensureQueryData(purchaseOrderQueryOptions(poId)),
            queryClient.ensureQueryData(purchaseOrderFormDataQueryOptions),
        ]),
});

function PurchaseOrderDetailPage() {
    const { poId } = Route.useParams();
    const { data: purchaseOrder } = useSuspenseQuery(
        purchaseOrderQueryOptions(poId)
    );
    const { data: formData } = useSuspenseQuery(
        purchaseOrderFormDataQueryOptions
    );

    return (
        <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
            <PurchaseOrderDetail
                purchaseOrder={purchaseOrder}
                warehouses={formData.warehouses}
            />
        </div>
    );
}
