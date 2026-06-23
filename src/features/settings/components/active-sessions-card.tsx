import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table";
import { authClient } from "#/lib/auth-client";

export default function ActiveSessionsCard() {
    const queryClient = useQueryClient();
    const { data: current } = authClient.useSession();

    const { data: sessions, isLoading } = useQuery({
        queryKey: ["auth", "sessions"],
        queryFn: async () => {
            const { data } = await authClient.listSessions({
                fetchOptions: {
                    onError: ({ error }) => {
                        toast.error(error.message ?? "Failed to load sessions");
                    },
                },
            });

            return data;
        },
    });

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });

    const handleRevoke = async (token: string) => {
        await authClient.revokeSession({
            token,
            fetchOptions: {
                onError: ({ error }) => {
                    toast.error(error.message ?? "Failed to revoke session");
                },
                onSuccess: () => {
                    toast.success("Session signed out");
                    invalidate();
                },
            },
        });
    };

    const handleRevokeOthers = async () => {
        await authClient.revokeOtherSessions({
            fetchOptions: {
                onError: ({ error }) => {
                    toast.error(error.message ?? "Failed to revoke sessions");
                },
                onSuccess: () => {
                    toast.success("Signed out of all other devices");
                    invalidate();
                },
            },
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Active sessions</CardTitle>
                    <CardDescription>
                        Devices currently signed in to your account.
                    </CardDescription>
                </div>

                <Button
                    onClick={handleRevokeOthers}
                    size="sm"
                    variant="outline"
                >
                    Sign out other devices
                </Button>
            </CardHeader>

            <CardContent>
                {isLoading || !sessions ? (
                    <p className="py-4 text-center text-muted-foreground text-sm">
                        Loading sessions…
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Device</TableHead>
                                <TableHead>IP address</TableHead>
                                <TableHead>Last active</TableHead>
                                <TableHead className="w-0" />
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {sessions.map((session) => {
                                const isCurrent =
                                    session.token === current?.session.token;
                                return (
                                    <TableRow key={session.id}>
                                        <TableCell className="max-w-xs truncate">
                                            {session.userAgent ??
                                                "Unknown device"}
                                            {isCurrent && (
                                                <Badge
                                                    className="ml-2"
                                                    variant="secondary"
                                                >
                                                    This device
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {session.ipAddress ?? "—"}
                                        </TableCell>
                                        <TableCell>
                                            {new Intl.DateTimeFormat("en-UG", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            }).format(
                                                new Date(session.updatedAt)
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {!isCurrent && (
                                                <Button
                                                    onClick={() =>
                                                        handleRevoke(
                                                            session.token
                                                        )
                                                    }
                                                    size="sm"
                                                    variant="ghost"
                                                >
                                                    Sign out
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
