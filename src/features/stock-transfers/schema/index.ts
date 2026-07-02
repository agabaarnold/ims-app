import { z } from "zod";

export const stockTransferItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().int().positive("Quantity must be greater than 0"),
});
export type StockTransferItemInput = z.infer<typeof stockTransferItemSchema>;

export const createStockTransferSchema = z
    .object({
        fromWarehouseId: z.string().min(1, "Source warehouse is required"),
        toWarehouseId: z.string().min(1, "Destination warehouse is required"),
        items: z
            .array(stockTransferItemSchema)
            .min(1, "Add at least one line item"),
    })
    .refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
        message: "Source and destination warehouses must be different",
        path: ["toWarehouseId"],
    });
export type CreateStockTransferInput = z.infer<
    typeof createStockTransferSchema
>;

export const getStockTransfersSchema = z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1).max(100),
    status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
});
export type GetStockTransfersInput = z.infer<typeof getStockTransfersSchema>;

export const getStockTransferSchema = z.object({ id: z.cuid2() });
export const completeStockTransferSchema = z.object({ id: z.cuid2() });
export const cancelStockTransferSchema = z.object({ id: z.cuid2() });
