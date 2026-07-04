import { Link } from "@tanstack/react-router";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table";

const STATUS_VARIANT: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
> = {
    PENDING: "outline",
    CONFIRMED: "secondary",
    PICKING: "secondary",
    SHIPPED: "secondary",
    DELIVERED: "default",
    CANCELLED: "destructive",
    RETURNED: "destructive",
};

const fmt = new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
});

interface RecentOrder {
    createdAt: Date;
    customer: { name: string } | null;
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
}

interface RecentOrdersTableProps {
    orders: RecentOrder[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent orders</CardTitle>
            </CardHeader>
            
            <CardContent>
                {orders.length === 0 ? (
                    <p className="py-6 text-center text-muted-foreground text-sm">
                        No orders yet.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <Link
                                            className="font-medium hover:underline"
                                            params={{ orderId: order.id }}
                                            to="/orders/$orderId"
                                        >
                                            {order.orderNumber}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {order.customer?.name ?? "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                STATUS_VARIANT[order.status] ??
                                                "outline"
                                            }
                                        >
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {fmt.format(order.totalAmount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
