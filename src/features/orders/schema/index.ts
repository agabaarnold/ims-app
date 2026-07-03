import { z } from "zod";

export const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PICKING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// States from which SELL movements already exist and inventory has been touched
export const INVENTORY_TOUCHED_STATUSES = new Set<OrderStatus>([
    "CONFIRMED",
    "PICKING",
]);

// States from which cancellation is permitted
export const CANCELLABLE_STATUSES = new Set<OrderStatus>([
    "PENDING",
    "CONFIRMED",
    "PICKING",
]);

// The linear forward transition map
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
    CONFIRMED: "PICKING",
    PICKING: "SHIPPED",
    SHIPPED: "DELIVERED",
};

export const orderItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
    // unitPrice is the selling price at time of order — pre-filled from product but editable
    unitPrice: z.number().nonnegative("Price must be 0 or more"),
    // discount is a percentage: 0–100
    discount: z.number().min(0).max(100),
});
export type OrderItemInput = z.infer<typeof orderItemSchema>;

export const createOrderSchema = z.object({
    customerId: z.string().min(1, "Customer is required"),
    note: z.string().optional().nullable(),
    items: z.array(orderItemSchema).min(1, "Add at least one item"),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const confirmOrderSchema = z.object({
    id: z.cuid2(),
    warehouseId: z.string().min(1, "Warehouse is required"),
});
export type ConfirmOrderInput = z.infer<typeof confirmOrderSchema>;

export const cancelOrderSchema = z.object({ id: z.cuid2() });
export const advanceOrderStatusSchema = z.object({ id: z.cuid2() });

export const getOrdersSchema = z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1).max(100),
    search: z.string().default(""),
    status: z.enum(ORDER_STATUSES).optional(),
});
export type GetOrdersInput = z.infer<typeof getOrdersSchema>;

export const getOrderSchema = z.object({ id: z.cuid2() });
