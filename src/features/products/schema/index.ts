import { z } from "zod";

export const getProductsSchema = z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
});
export type GetProductsInput = z.infer<typeof getProductsSchema>;

export const getProductSchema = z.object({
    id: z.cuid2(),
});
export type GetProductInput = z.infer<typeof getProductSchema>;

export const createProductSchema = z
    .object({
        name: z.string().min(1),
        description: z.string().optional(),
        sku: z.string(),
        imageUrl: z.string().optional(),
        unit: z.string().default("pcs"),
        categoryId: z.string(),
        costPrice: z.number().positive(),
        sellingPrice: z.number().positive(),
        reorderPoint: z.number().int().min(0),
        reorderQty: z.number().positive(),
        isActive: z.boolean().default(true),
        supplierId: z.string().optional(),
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

export const searchProductsSchema = z.object({
    search: z.string(),
});
export type SearchProductsInput = z.infer<typeof searchProductsSchema>;
