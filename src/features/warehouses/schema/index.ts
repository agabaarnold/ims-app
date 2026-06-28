import { z } from "zod";

export const createWarehouseSchema = z.object({
    name: z.string().min(1, "Name is required"),
    location: z.string().optional().nullable(),
});
export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;

export const updateWarehouseSchema = createWarehouseSchema.extend({
    id: z.cuid2(),
});
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;

export const deleteWarehouseSchema = z.object({ id: z.cuid2() });
export type DeleteWarehouseInput = z.infer<typeof deleteWarehouseSchema>;