import { createFileRoute, redirect } from "@tanstack/react-router";
import UsersTable from "#/features/admin/components/users-table";

export const Route = createFileRoute("/_app/admin/users/")({
    component: UsersPage,
    loader: ({ context }) => {
        if (
            context.session.user.role !== "admin" &&
            context.session.user.role !== "superAdmin"
        ) {
            throw redirect({ to: "/forbidden", replace: true });
        }
    },
});

function UsersPage() {
    return (
        <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
            <div className="mb-6">
                <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                    User management
                </h1>
                <p className="mt-1 text-muted-foreground text-sm">
                    Manage staff accounts, roles, and access.
                </p>
            </div>

            <UsersTable />
        </div>
    );
}
