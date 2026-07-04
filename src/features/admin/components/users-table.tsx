/** biome-ignore-all lint/style/noNestedTernary: For simplicity */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserWithRole } from "better-auth/plugins";
import { useState } from "react";
import { toast } from "react-hot-toast";
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
import { useDebounce } from "#/hooks/use-debounce";
import { authClient } from "#/lib/auth-client";
import BanUserDialog from "./ban-user-dialog";
import CreateUserDialog from "./create-user-dialog";

const adminClient = authClient.admin;

const PAGE_SIZE = 10;

export default function UsersTable() {
    const queryClient = useQueryClient();
    const { data: session } = authClient.useSession();
    const currentUserId = session?.user.id;

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [banTarget, setBanTarget] = useState<UserWithRole | undefined>();
    const [createOpen, setCreateOpen] = useState(false);

    const debouncedSearch = useDebounce(search, 500);

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

    const { data, isLoading } = useQuery({
        queryKey: ["admin", "users", page, debouncedSearch],
        queryFn: async () => {
            const result = await adminClient.listUsers({
                query: {
                    limit: PAGE_SIZE,
                    offset: (page - 1) * PAGE_SIZE,
                    searchValue: debouncedSearch || undefined,
                    searchField: "name",
                    searchOperator: "contains",
                    sortBy: "createdAt",
                    sortDirection: "desc",
                },
            });
            if (result.error) {
                throw new Error(result.error.message);
            }
            return result.data;
        },
    });

    const handleSetRole = async (userId: string, role: string) => {
        try {
            const { error } = await adminClient.setRole({
                userId,
                role: role as "admin" | "staff" | "superAdmin" | "manager",
            });
            if (error) {
                throw new Error(error.message);
            }

            toast.success(`Role updated to ${role}`);
            invalidate();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to update role"
            );
        }
    };

    const handleUnban = async (userId: string) => {
        try {
            const { error } = await adminClient.unbanUser({ userId });
            if (error) {
                throw new Error(error.message);
            }
            toast.success("User unbanned");
            invalidate();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to unban user"
            );
        }
    };

    const pageCount = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <Input
                    className="max-w-sm"
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    placeholder="Search by name…"
                    value={search}
                />
                <Button onClick={() => setCreateOpen(true)}>New user</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-0" />
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell
                                className="shimmer py-8 text-center"
                                colSpan={5}
                            >
                                Loading users…
                            </TableCell>
                        </TableRow>
                    ) : data?.users.length ? (
                        data.users.map((user) => {
                            const isSelf = user.id === currentUserId;
                            return (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.name}
                                        {isSelf && (
                                            <Badge
                                                className="ml-2"
                                                variant="secondary"
                                            >
                                                You
                                            </Badge>
                                        )}
                                    </TableCell>

                                    <TableCell>{user.email}</TableCell>

                                    <TableCell>
                                        {isSelf ? (
                                            <Badge variant="outline">
                                                {user.role}
                                            </Badge>
                                        ) : (
                                            <Select
                                                disabled={isSelf}
                                                onValueChange={(role) => {
                                                    if (role) {
                                                        handleSetRole(
                                                            user.id,
                                                            role
                                                        );
                                                    }
                                                }}
                                                value={user.role}
                                            >
                                                <SelectTrigger className="h-7 w-24 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="staff">
                                                        Staff
                                                    </SelectItem>
                                                    <SelectItem value="manager">
                                                        Manager
                                                    </SelectItem>
                                                    <SelectItem value="admin">
                                                        Admin
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {user.banned ? (
                                            <Badge variant="destructive">
                                                Banned
                                            </Badge>
                                        ) : user.emailVerified ? (
                                            <Badge variant="default">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">
                                                Unverified
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            {!isSelf &&
                                                (user.banned ? (
                                                    <Button
                                                        onClick={() =>
                                                            handleUnban(user.id)
                                                        }
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        Unban
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() =>
                                                            setBanTarget(user)
                                                        }
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        Ban
                                                    </Button>
                                                ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell
                                className="py-8 text-center text-muted-foreground"
                                colSpan={5}
                            >
                                No users found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                    Page {page} of {Math.max(pageCount, 1)}
                    {data && (
                        <span className="ml-2 text-muted-foreground/60">
                            ({data.total} total)
                        </span>
                    )}
                </p>

                <div className="flex gap-2">
                    <Button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        size="sm"
                        variant="outline"
                    >
                        Previous
                    </Button>

                    <Button
                        disabled={page >= pageCount}
                        onClick={() => setPage((p) => p + 1)}
                        size="sm"
                        variant="outline"
                    >
                        Next
                    </Button>
                </div>
            </div>

            <BanUserDialog
                onClose={() => setBanTarget(undefined)}
                onSuccess={invalidate}
                user={banTarget}
            />

            <CreateUserDialog
                onOpenChange={setCreateOpen}
                onSuccess={invalidate}
                open={createOpen}
            />
        </div>
    );
}
