import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { GetAuditLogsInput } from "../schema";
import { getAuditLogs } from "./index";

export const auditLogsQueryOptions = (params: GetAuditLogsInput) =>
    queryOptions({
        queryKey: [
            "audit-log",
            params.page,
            params.pageSize,
            params.action,
            params.entityType,
            params.search,
        ],
        queryFn: () => getAuditLogs({ data: params }),
        placeholderData: keepPreviousData,
    });
