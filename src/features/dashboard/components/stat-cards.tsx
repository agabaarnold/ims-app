import {
    IconAlertTriangle,
    IconCurrencyDollar,
    IconPackage,
    IconShoppingCart,
    type TablerIcon,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

const fmt = new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
    notation: "compact",
});

interface StatCardsProps {
    monthlyRevenue: number;
    openOrdersCount: number;
    totalActiveProducts: number;
    totalLowStockItems: number;
}

interface CardType {
    alert?: boolean;
    description: string;
    icon: TablerIcon;
    title: string;
    value: string;
}

export default function StatCards({
    totalActiveProducts,
    openOrdersCount,
    monthlyRevenue,
    totalLowStockItems,
}: StatCardsProps) {
    const cards: CardType[] = [
        {
            title: "Active products",
            value: totalActiveProducts.toLocaleString(),
            icon: IconPackage,
            description: "Products available for sale",
        },
        {
            title: "Open orders",
            value: openOrdersCount.toLocaleString(),
            icon: IconShoppingCart,
            description: "Pending through shipped",
        },
        {
            title: "Revenue this month",
            value: fmt.format(monthlyRevenue),
            icon: IconCurrencyDollar,
            description: "From delivered orders",
        },
        {
            title: "Low stock items",
            value: totalLowStockItems.toLocaleString(),
            icon: IconAlertTriangle,
            description: "Below reorder point",
            alert: totalLowStockItems > 0,
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(({ title, value, icon: Icon, description, alert }) => (
                <Card key={title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="font-medium text-muted-foreground text-sm">
                            {title}
                        </CardTitle>

                        <Icon
                            className={
                                alert
                                    ? "size-5 text-destructive"
                                    : "size-5 text-muted-foreground"
                            }
                        />
                    </CardHeader>

                    <CardContent>
                        <p className="font-bold text-2xl">{value}</p>
                        <p className="mt-1 text-muted-foreground text-xs">
                            {description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
