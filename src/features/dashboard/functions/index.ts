import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/lib/db";
import { authMiddleware } from "#/middleware";

const OPEN_ORDER_STATUSES = ["PENDING", "CONFIRMED", "PICKING", "SHIPPED"] as const;
const RECENT_ORDERS_LIMIT = 5;
const LOW_STOCK_SLICE_LIMIT = 10;
const REVENUE_DAYS = 30;

export const getDashboardData = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(async () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - (REVENUE_DAYS - 1));
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const [
            totalActiveProducts,
            openOrdersCount,
            monthlyRevenueAgg,
            productsWithInventory,
            recentOrders,
            deliveredOrders,
        ] = await Promise.all([
            prisma.product.count({ where: { isActive: true } }),

            prisma.order.count({
                where: {
                    status: {
                        in: [...OPEN_ORDER_STATUSES],
                    },
                },
            }),

            prisma.order.aggregate({
                where: {
                    status: "DELIVERED",
                    createdAt: { gte: startOfMonth },
                },
                _sum: { totalAmount: true },
            }),

            // Fetch products with reorderPoint > 0 and their inventory totals
            // for low-stock detection. Filter is done in application code since
            // Prisma can't filter by aggregated relation sums without raw SQL.
            prisma.product.findMany({
                where: { isActive: true, reorderPoint: { gt: 0 } },
                select: {
                    id: true,
                    name: true,
                    sku: true,
                    reorderPoint: true,
                    category: { select: { name: true } },
                    inventoryItems: { select: { quantity: true } },
                },
            }),

            prisma.order.findMany({
                take: RECENT_ORDERS_LIMIT,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    totalAmount: true,
                    createdAt: true,
                    customer: { select: { name: true } },
                },
            }),

            prisma.order.findMany({
                where: {
                    status: "DELIVERED",
                    createdAt: { gte: thirtyDaysAgo },
                },
                select: { createdAt: true, totalAmount: true },
            }),
        ]);

        const allLowStockProducts = productsWithInventory
            .map((p) => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                category: p.category.name,
                reorderPoint: p.reorderPoint,
                totalQuantity: p.inventoryItems.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                ),
            }))
            .filter((p) => p.totalQuantity < p.reorderPoint)
            .sort((a, b) => a.totalQuantity - b.totalQuantity); // most critical first

        const lowStockProducts = allLowStockProducts.slice(0, LOW_STOCK_SLICE_LIMIT);

        // Daily revenue for last 30 days — initialise every day to 0 so the
        // chart always shows a full 30-day window with no gaps
        const revenueByDate = new Map<string, number>();
        for (let offset = 0; offset < REVENUE_DAYS; offset++) {
            const d = new Date(thirtyDaysAgo);
            d.setDate(d.getDate() + offset);
            revenueByDate.set(d.toISOString().slice(0, 10), 0);
        }
        for (const order of deliveredOrders) {
            const date = order.createdAt.toISOString().slice(0, 10);
            if (revenueByDate.has(date)) {
                revenueByDate.set(
                    date,
                    (revenueByDate.get(date) ?? 0) +
                        order.totalAmount.toNumber()
                );
            }
        }
        const dailyRevenue = Array.from(revenueByDate.entries()).map(
            ([date, revenue]) => ({ date, revenue })
        );

        return {
            stats: {
                totalActiveProducts,
                openOrdersCount,
                monthlyRevenue:
                    monthlyRevenueAgg._sum.totalAmount?.toNumber() ?? 0,
                totalLowStockItems: allLowStockProducts.length,
            },
            lowStockProducts,
            recentOrders: recentOrders.map((o) => ({
                ...o,
                totalAmount: o.totalAmount.toNumber(),
            })),
            dailyRevenue,
        };
    });
