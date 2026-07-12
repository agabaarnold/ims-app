import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
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
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "../schema";

const ACTION_VARIANT: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
> = {
    CREATE: "default",
    UPDATE: "secondary",
    DELETE: "destructive",
    APPROVE: "default",
    CANCEL: "destructive",
    RECEIVE: "secondary",
    TRANSFER: "secondary",
    ADJUST: "outline",
};

interface AuditLogRow {
    action: string;
    after: unknown;
    before: unknown;
    createdAt: Date;
    entityId: string;
    entityType: string;
    id: string;
    user: { id: string; name: string; email: string };
}

interface AuditLogTableProps {
    action: string | undefined;
    entityType: string | undefined;
    logs: AuditLogRow[];
    onActionChange: (action: string | undefined) => void;
    onEntityTypeChange: (entityType: string | undefined) => void;
    onPageChange: (page: number) => void;
    onSearchChange: (search: string) => void;
    page: number;
    pageCount: number;
    search: string;
}

const dateFmt = new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
});

export default function AuditLogTable({
    logs,
    search,
    onSearchChange,
    action,
    onActionChange,
    entityType,
    onEntityTypeChange,
    page,
    pageCount,
    onPageChange,
}: AuditLogTableProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <Input
                    aria-label="Search by user or entity id"
                    className="max-w-sm"
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by user or entity id…"
                    value={search}
                />

                <Select
                    onValueChange={(value) =>
                        onActionChange(value === "ALL" ? undefined : value)
                    }
                    value={action ?? "ALL"}
                >
                    <SelectTrigger
                        aria-label="Filter by action"
                        className="w-40"
                    >
                        <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All actions</SelectItem>
                        {AUDIT_ACTIONS.map((a) => (
                            <SelectItem key={a} value={a}>
                                {a}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    onValueChange={(value) =>
                        onEntityTypeChange(value === "ALL" ? undefined : value)
                    }
                    value={entityType ?? "ALL"}
                >
                    <SelectTrigger
                        aria-label="Filter by entity type"
                        className="w-48"
                    >
                        <SelectValue placeholder="All entity types" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="ALL">All entity types</SelectItem>
                        {AUDIT_ENTITY_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                                {t.replaceAll("_", " ")}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Changes</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {logs.length === 0 ? (
                        <TableRow>
                            <TableCell
                                className="py-8 text-center text-muted-foreground"
                                colSpan={5}
                            >
                                No audit log entries found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap">
                                    {dateFmt.format(new Date(log.createdAt))}
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {log.user.name}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            {log.user.email}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge
                                        variant={
                                            ACTION_VARIANT[log.action] ??
                                            "outline"
                                        }
                                    >
                                        {log.action}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {log.entityType.replaceAll(
                                                "_",
                                                " "
                                            )}
                                        </span>
                                        <span className="font-mono text-muted-foreground text-xs">
                                            {log.entityId}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell className="max-w-md truncate text-muted-foreground text-sm">
                                    {summarizeChanges(log.before, log.after)}
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

function summarizeChanges(before: unknown, after: unknown) {
    if (before === null && after !== null) {
        return "Created";
    }
    if (after === null && before !== null) {
        return "Deleted";
    }
    if (
        !(before && after) ||
        typeof before !== "object" ||
        typeof after !== "object"
    ) {
        return "—";
    }

    const beforeObj = before as Record<string, unknown>;
    const afterObj = after as Record<string, unknown>;
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
