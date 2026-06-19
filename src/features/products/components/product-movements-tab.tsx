import { useQuery } from "@tanstack/react-query";
import { Button } from "#/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table";
import { formatDate } from "#/lib/utils";
import { getProductMovements } from "../functions";

const PAGE_SIZE = 10;
const OUTBOUND_TYPES = new Set(["SELL", "TRANSFER_OUT"]);

interface ProductMovementsTabProps {
    active: boolean;
    onPageChange: (page: number) => void;
    page: number;
    productId: string;
}

export default function ProductMovementsTab({
    productId,
    page,
    active,
    onPageChange,
}: ProductMovementsTabProps) {
    const { data, isLoading } = useQuery({
        queryKey: ["products", productId, "movements", page],
        queryFn: () =>
            getProductMovements({
                data: { id: productId, page, pageSize: PAGE_SIZE },
            }),
        enabled: active,
    });

    if (!active) {
        return null;
    }

    if (isLoading || !data) {
        return (
            <p className="py-8 text-center text-muted-foreground text-sm">
                Loading movements…
            </p>
        );
    }

    if (data.movements.length === 0) {
        return (
            <p className="py-8 text-center text-muted-foreground text-sm">
                No stock movements recorded for this product.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>By</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.movements.map((movement) => (
                        <TableRow key={movement.id}>
                            <TableCell>
                                {formatDate(movement.createdAt)}
                            </TableCell>

                            <TableCell>{movement.type}</TableCell>

                            <TableCell>{movement.warehouse.name}</TableCell>

                            <TableCell className="text-right">
                                {OUTBOUND_TYPES.has(movement.type)
                                    ? `-${movement.quantity}`
                                    : `+${movement.quantity}`}
                            </TableCell>

                            <TableCell>{movement.reference ?? "—"}</TableCell>

                            <TableCell>{movement.createdBy.name}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                    Page {page} of {data.pageCount}
                </p>
                <div className="flex gap-2">
                    <Button
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                        size="sm"
                        variant="outline"
                    >
                        Previous
                    </Button>
                    <Button
                        disabled={page >= data.pageCount}
                        onClick={() => onPageChange(page + 1)}
                        size="sm"
                        variant="outline"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
