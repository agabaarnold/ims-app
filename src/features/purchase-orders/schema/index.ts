import { z } from "zod";

export const purchaseOrderItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    orderedQty: z.number().int().positive("Quantity must be greater than 0"),
    unitCost: z.number().nonnegative("Unit cost must be 0 or more"),
});
export type PurchaseOrderItemInput = z.infer<typeof purchaseOrderItemSchema>;

export const createPurchaseOrderSchema = z.object({
    supplierId: z.string().min(1, "Supplier is required"),
    expectedDate: z.string().optional().nullable(), // raw <input type="date"> string
    note: z.string().optional().nullable(),
    items: z
        .array(purchaseOrderItemSchema)
        .min(1, "Add at least one line item"),
});
export type CreatePurchaseOrderInput = z.infer<
    typeof createPurchaseOrderSchema
>;

// Server-only: coerces the date string to a real Date for Prisma. Kept separate
// from the form-facing schema for the same reason imageUrl's preprocess was split
// out on Product — z.coerce/.preprocess() breaks TanStack Form's input-type match.
export const createPurchaseOrderServerSchema = createPurchaseOrderSchema.extend(
    {
        expectedDate: z.preprocess(
            (val) => (val === "" || val == null ? undefined : val),
            z.coerce.date().optional()
        ),
    }
);

const PO_STATUSES = [
    "DRAFT",
    "SENT",
    "PARTIAL",
    "RECEIVED",
    "CANCELLED",
] as const;

export const getPurchaseOrdersSchema = z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    search: z.string().default(""),
    status: z.enum(PO_STATUSES).optional(),
});
export type GetPurchaseOrdersInput = z.infer<typeof getPurchaseOrdersSchema>;

export const getPurchaseOrderSchema = z.object({ id: z.cuid2() });
export const sendPurchaseOrderSchema = z.object({ id: z.cuid2() });
export const cancelPurchaseOrderSchema = z.object({ id: z.cuid2() });

export const receivePurchaseOrderSchema = z.object({
    id: z.cuid2(),
    warehouseId: z.string().min(1, "Warehouse is required"),
    lines: z
        .array(
            z.object({
                purchaseOrderItemId: z.cuid2(),
                quantity: z.number().int().nonnegative(),
            })
        )
        .min(1),
});
export type ReceivePurchaseOrderInput = z.infer<
    typeof receivePurchaseOrderSchema
>;