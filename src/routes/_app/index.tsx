import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import DailyRevenueChart from "#/features/dashboard/components/daily-revenue-chart";
import LowStockTable from "#/features/dashboard/components/low-stock-table";
import RecentOrdersTable from "#/features/dashboard/components/recent-orders-table";
import StatCards from "#/features/dashboard/components/stat-cards";
import { dashboardQueryOptions } from "#/features/dashboard/functions/queries";

export const Route = createFileRoute("/_app/")({
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData(dashboardQueryOptions),
    component: DashboardPage,
});

function DashboardPage() {
    const { data } = useSuspenseQuery(dashboardQueryOptions);

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
            <div>
                <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                    Dashboard
                </h1>
                <p className="mt-1 text-muted-foreground text-sm">
                    Overview of your inventory and sales.
                </p>
            </div>

            <StatCards {...data.stats} />

            <DailyRevenueChart data={data.dailyRevenue} />

            <div className="grid gap-6 lg:grid-cols-2">
                <LowStockTable products={data.lowStockProducts} />
                <RecentOrdersTable orders={data.recentOrders} />
            </div>
        </div>
    );
}
