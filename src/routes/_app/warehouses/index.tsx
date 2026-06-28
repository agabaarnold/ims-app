import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import WarehousesTable from "#/features/warehouses/components/warehouses-table";
import { warehousesQueryOptions } from "#/features/warehouses/functions/queries";

export const Route = createFileRoute("/_app/warehouses/")({
    component: WarehousesPage,
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData(warehousesQueryOptions),
});

function WarehousesPage() {
    const { data: warehouses } = useSuspenseQuery(warehousesQueryOptions);

    return (
        <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
            <div className="mb-6">
                <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                    Warehouses
                </h1>
                <p className="mt-1 text-muted-foreground text-sm">
                    Manage the physical locations where you store inventory.
                </p>
            </div>

            <WarehousesTable warehouses={warehouses} />
        </div>
    );
}
