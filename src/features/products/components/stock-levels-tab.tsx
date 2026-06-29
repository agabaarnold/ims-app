import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table";

interface StockLevelsTableProps {
    inventoryItems: {
        id: string;
        quantity: number;
        reservedQuantity: number;
        warehouse: { id: string; name: string };
    }[];
}

export default function StockLevelsTable({
    inventoryItems,
}: StockLevelsTableProps) {
    if (inventoryItems.length === 0) {
        return (
            <p className="py-8 text-center text-muted-foreground text-sm">
                No stock recorded for this product in any warehouse yet.
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-right">On hand</TableHead>
                    <TableHead className="text-right">Reserved</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {inventoryItems.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>{item.warehouse.name}</TableCell>

                        <TableCell className="text-right">
                            {item.quantity}
                        </TableCell>

                        <TableCell className="text-right">
                            {item.reservedQuantity}
                        </TableCell>

                        <TableCell className="text-right">
                            {item.quantity - item.reservedQuantity}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
