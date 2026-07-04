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

interface LowStockProduct {
    category: string;
    id: string;
    name: string;
    reorderPoint: number;
    sku: string;
    totalQuantity: number;
}

interface LowStockTableProps {
    products: LowStockProduct[];
}

export default function LowStockTable({ products }: LowStockTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Low stock alerts</CardTitle>
            </CardHeader>

            <CardContent>
                {products.length === 0 ? (
                    <p className="py-6 text-center text-muted-foreground text-sm">
                        All products are adequately stocked.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">
                                    In stock
                                </TableHead>
                                <TableHead className="text-right">
                                    Reorder at
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {products.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>
                                        <Link
                                            className="font-medium hover:underline"
                                            params={{ productId: p.id }}
                                            to="/products/$productId"
                                        >
                                            {p.name}
                                        </Link>
                                        
                                        <span className="ml-2 text-muted-foreground text-xs">
                                            {p.sku}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <Badge
                                            variant={
                                                p.totalQuantity === 0
                                                    ? "destructive"
                                                    : "secondary"
                                            }
                                        >
                                            {p.totalQuantity}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-right text-muted-foreground">
                                        {p.reorderPoint}
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
