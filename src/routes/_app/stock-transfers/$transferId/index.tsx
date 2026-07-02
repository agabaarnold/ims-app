import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { buttonVariants } from "#/components/ui/button";
import StockTransferDetail from "#/features/stock-transfers/components/stock-transfer-detail";
import { stockTransferQueryOptions } from "#/features/stock-transfers/functions/queries";

export const Route = createFileRoute("/_app/stock-transfers/$transferId/")({
    loader: ({ context: { queryClient }, params: { transferId } }) =>
        queryClient.ensureQueryData(stockTransferQueryOptions(transferId)),
    component: StockTransferDetailPage,
});

function StockTransferDetailPage() {
    const { transferId } = Route.useParams();
    const { data: transfer } = useSuspenseQuery(
        stockTransferQueryOptions(transferId)
    );

    return (
        <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
            <div className="mb-6">
                <Link
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                    to="/stock-transfers"
                >
                    ← Back to transfers
                </Link>
            </div>

            <StockTransferDetail transfer={transfer} />
        </div>
    );
}