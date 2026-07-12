import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import AuditLogTable from "#/features/audit-log/components/audit-log-table";
import { auditLogsQueryOptions } from "#/features/audit-log/functions/queries";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "#/features/audit-log/schema";

const PAGE_SIZE = 20;

const searchSchema = z.object({
    page: z.number().int().min(1).default(1),
    search: z.string().default(""),
    action: z.enum(AUDIT_ACTIONS).optional(),
    entityType: z.enum(AUDIT_ENTITY_TYPES).optional(),
});

export const Route = createFileRoute("/_app/audit-log/")({
    validateSearch: searchSchema,
    loaderDeps: ({ search }) => search,
    beforeLoad: ({ context }) => {
        const role = context.session.user.role;
        if (role !== "admin" && role !== "superAdmin") {
            throw redirect({ to: "/forbidden", replace: true });
        }
    },
    loader: ({
        context: { queryClient },
        deps: { page, search, action, entityType },
    }) =>
        queryClient.ensureQueryData(
            auditLogsQueryOptions({
                page,
                pageSize: PAGE_SIZE,
                search,
                action,
                entityType,
            })
        ),
    component: AuditLogPage,
});

function AuditLogPage() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();

    const { data } = useSuspenseQuery(
        auditLogsQueryOptions({
            page: search.page,
            pageSize: PAGE_SIZE,
            search: search.search,
            action: search.action,
            entityType: search.entityType,
        })
    );

    return (
        <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
            <div className="mb-6">
                <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                    Audit log
                </h1>

                <p className="mt-1 text-muted-foreground text-sm">
                    A complete history of every create, update, delete, and
                    workflow action across the system.
                </p>
            </div>

            <AuditLogTable
                action={search.action}
                entityType={search.entityType}
                logs={data.logs}
                onActionChange={(action) =>
                    navigate({
                        search: (prev) => ({
                            ...prev,
                            action: action as z.infer<
                                typeof searchSchema
                            >["action"],
                            page: 1,
                        }),
                    })
                }
                onEntityTypeChange={(entityType) =>
                    navigate({
                        search: (prev) => ({
                            ...prev,
                            entityType: entityType as z.infer<
                                typeof searchSchema
                            >["entityType"],
                            page: 1,
                        }),
                    })
                }
                onPageChange={(page) =>
                    navigate({ search: (prev) => ({ ...prev, page }) })
                }
                onSearchChange={(search) =>
                    navigate({
                        search: (prev) => ({ ...prev, search, page: 1 }),
                    })
                }
                page={data.page}
                pageCount={data.pageCount}
                search={search.search}
            />
        </div>
    );
}
