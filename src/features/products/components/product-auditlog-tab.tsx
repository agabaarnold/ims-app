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
import { getProductAuditLogs } from "../functions";

const PAGE_SIZE = 10;

interface ProductAuditLogTabProps {
    active: boolean;
    onPageChange: (page: number) => void;
    page: number;
    productId: string;
}

export default function ProductAuditLogTab({
    productId,
    page,
    active,
    onPageChange,
}: ProductAuditLogTabProps) {
    const { data, isLoading } = useQuery({
        queryKey: ["products", productId, "audit", page],
        queryFn: () =>
            getProductAuditLogs({
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
                Loading audit log…
            </p>
        );
    }

    if (data.logs.length === 0) {
        return (
            <p className="py-8 text-center text-muted-foreground text-sm">
                No audit history for this product.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>By</TableHead>
                        <TableHead>Changes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.logs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell>
                                {new Intl.DateTimeFormat("en-UG", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                }).format(new Date(log.createdAt))}
                            </TableCell>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>{log.user.name}</TableCell>
                            <TableCell className="max-w-md truncate text-muted-foreground text-sm">
                                {summarizeChanges(log.before, log.after)}
                            </TableCell>
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

function summarizeChanges(before: unknown, after: unknown) {
function summarizeChanges(before: unknown, after: unknown) {
    if (
        !before ||
        !after ||
        typeof before !== "object" ||
        typeof after !== "object"
    ) {
        return "—";
    }
    const beforeObj = before as Record<string, unknown>;
    const afterObj = after as Record<string, unknown>;
    if (!(beforeObj && afterObj)) {
        return "—";
    }

    const allKeys = new Set([
        ...Object.keys(beforeObj),
        ...Object.keys(afterObj),
    ]);
    const changedKeys = Array.from(allKeys).filter(
        (key) =>
            JSON.stringify(afterObj[key]) !== JSON.stringify(beforeObj[key])
    );

    return changedKeys.length > 0
        ? `Changed: ${changedKeys.join(", ")}`
        : "No field changes";
}
