import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/lib/db";
import { authMiddleware } from "#/middleware";
import { getAuditLogsSchema } from "../schema";

// TODO: Only superAdmin may view the global audit log

export const getAuditLogs = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(getAuditLogsSchema)
    .handler(async ({ context: { session }, data }) => {
        const role = session.user.role;
        if (role !== "admin" && role !== "superAdmin") {
            throw new Error("You do not have permission to view the audit log");
        }

        const { page, pageSize, action, entityType, search } = data;
        const skip = (page - 1) * pageSize;

        const where = {
            AND: [
                action ? { action } : {},
                entityType ? { entityType } : {},
                search
                    ? {
                          OR: [
                              {
                                  user: {
                                      name: {
                                          contains: search,
                                          mode: "insensitive" as const,
                                      },
                                  },
                              },
                              {
                                  entityId: {
                                      contains: search,
                                      mode: "insensitive" as const,
                                  },
                              },
                          ],
                      }
                    : {},
            ],
        };

        const [logs, total] = await prisma.$transaction([
            prisma.auditLog.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
            prisma.auditLog.count({ where }),
        ]);

        return {
            logs,
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
        };
    });