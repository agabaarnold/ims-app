import { Link } from "@tanstack/react-router";
import { Badge } from "#/components/ui/badge";
import { Button, buttonVariants } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "#/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table";
import { formatCurrency, formatDate } from "#/lib/utils";

const STATUS_VARIANT: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
> = {
    DRAFT: "outline",
    SENT: "secondary",
    PARTIAL: "secondary",
    RECEIVED: "default",
    CANCELLED: "destructive",
};

interface PurchaseOrderRow {
    _count: { items: number };
    expectedDate: Date | null;
    id: string;
    poNumber: string;
    status: string;
    supplier: { id: string; name: string };
    totalAmount: number;
}

interface PurchaseOrdersTableProps {
    onPageChange: (page: number) => void;
    onSearchChange: (search: string) => void;
    onStatusChange: (status: string | undefined) => void;
    page: number;
    pageCount: number;
    purchaseOrders: PurchaseOrderRow[];
    search: string;
    status: string | undefined;
}

export default function PurchaseOrdersTable({
    purchaseOrders,
    search,
    onSearchChange,
    status,
    onStatusChange,
    page,
    pageCount,
    onPageChange,
}: PurchaseOrdersTableProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex gap-2">
                    <Input
                        aria-label="Search purchase orders"
                        className="max-w-sm"
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search by PO number or supplier…"
                        value={search}
                    />
                    <Select
                        onValueChange={(value) =>
                            // biome-ignore lint/style/noNonNullAssertion: Ignore
                            onStatusChange(value === "ALL" ? undefined : value!)
                        }
                        value={status ?? "ALL"}
                    >
                        <SelectTrigger
                            aria-label="Filter by status"
                            className="w-40"
                        >
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All statuses</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="SENT">Sent</SelectItem>
                            <SelectItem value="PARTIAL">Partial</SelectItem>
                            <SelectItem value="RECEIVED">Received</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Link className={buttonVariants()} to="/purchase-orders/new">
                    New purchase order
                </Link>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>PO number</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Items</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Expected</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {purchaseOrders.length === 0 ? (
                        <TableRow>
                            <TableCell
                                className="py-8 text-center text-muted-foreground"
                                colSpan={6}
                            >
                                No purchase orders found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        purchaseOrders.map((po) => (
                            <TableRow key={po.id}>
                                <TableCell>
                                    <Link
                                        className="font-medium hover:underline"
                                        params={{ poId: po.id }}
                                        to="/purchase-orders/$poId"
                                    >
                                        {po.poNumber}
                                    </Link>
                                </TableCell>
                                <TableCell>{po.supplier.name}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            STATUS_VARIANT[po.status] ??
                                            "outline"
                                        }
                                    >
                                        {po.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {po._count.items}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(po.totalAmount)}
                                </TableCell>
                                <TableCell>
                                    {po.expectedDate
                                        ? formatDate(new Date(po.expectedDate))
                                        : "—"}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                    Page {page} of {Math.max(pageCount, 1)}
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
                        disabled={page >= pageCount}
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
