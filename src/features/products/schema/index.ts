import { z } from "zod";

export const getProductsSchema = z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    search: z.string().default(""),
});
export type GetProductsInput = z.infer<typeof getProductsSchema>;

export const getProductSchema = z.object({
    id: z.cuid2(),
});
export type GetProductInput = z.infer<typeof getProductSchema>;

const units = ["pcs", "kg", "l", "box", "pack"] as const;

export const createProductSchema = z
    .object({
        name: z.string().min(1, "Product name is required"),
        description: z.string().optional().nullable(),
        categoryId: z.string().min(1, "Category is required"),
        supplierId: z.string().optional().nullable(),
        unit: z.enum(units),
        costPrice: z.coerce
            .number()
            .nonnegative("Cost price must be 0 or more"),
        sellingPrice: z.coerce
            .number()
            .nonnegative("Selling price must be 0 or more"),
        reorderPoint: z.coerce.number().int().nonnegative().default(0),
        reorderQty: z.coerce.number().int().nonnegative().default(0),
        imageUrl: z.url("Enter a valid image URL").optional().nullable(),
        isActive: z.boolean().default(true),
    })
    .refine((data) => data.sellingPrice >= data.costPrice, {
        error: "Selling price must be greater than or equal to cost price",
        path: ["sellingPrice"],
    });
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.extend({
    id: z.cuid2(),
});
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const archiveProductSchema = getProductSchema;
export type ArchiveProductInput = z.infer<typeof archiveProductSchema>;
