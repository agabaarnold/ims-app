import { z } from "zod";

export const AUDIT_ACTIONS = [
    "CREATE",
    "UPDATE",
    "DELETE",
    "APPROVE",
    "CANCEL",
    "RECEIVE",
    "TRANSFER",
    "ADJUST",
] as const;

export const AUDIT_ENTITY_TYPES = [
    "USER",
    "CATEGORY",
    "SUPPLIER",
    "PRODUCT",
    "WAREHOUSE",
    "INVENTORY_ITEM",
    "STOCK_MOVEMENT",
    "STOCK_TRANSFER",
    "CUSTOMER",
    "ORDER",
    "ORDER_ITEM",
    "PURCHASE_ORDER",
    "PURCHASE_ORDER_ITEM",
] as const;

export const getAuditLogsSchema = z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1).max(100),
    action: z.enum(AUDIT_ACTIONS).optional(),
    entityType: z.enum(AUDIT_ENTITY_TYPES).optional(),
    search: z.string().default(""), // matches against user name/email or entityId
});
export type GetAuditLogsInput = z.infer<typeof getAuditLogsSchema>;
