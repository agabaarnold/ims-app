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

export const UNIT_VALUES = [
    "pcs",
    "kg",
    "g",
    "l",
    "ml",
    "box",
    "pack",
    "carton",
    "dozen",
    "bag",
    "m",
    "m2",
] as const;

export type Unit = (typeof UNIT_VALUES)[number];

// Labels keyed to the type — `satisfies` catches any missing entries
export const UNIT_LABELS = {
    pcs: "Pieces",
    kg: "Kilograms (kg)",
    g: "Grams (g)",
    l: "Litres (l)",
    ml: "Millilitres (ml)",
    box: "Box",
    pack: "Pack",
    carton: "Carton",
    dozen: "Dozen",
    bag: "Bag",
    m: "Metres (m)",
    m2: "Square metres (m²)",
} satisfies Record<Unit, string>;

// Derive PRODUCT_UNITS from UNIT_VALUES — not the other way around
export const PRODUCT_UNITS = UNIT_VALUES.map((value) => ({
    value,
    label: UNIT_LABELS[value],
}));

const emptyStringToNull = (value: unknown) =>
    typeof value === "string" && value.trim() === "" ? null : value;

const isBlank = (value: string | null | undefined) =>
    value === null || value === undefined || value.trim() === "";

export const createProductSchema = z
    .object({
        name: z.string().min(1, "Product name is required"),
        description: z.string().optional().nullable(),
        categoryId: z.string().min(1, "Category is required"),
        supplierId: z.string().optional().nullable(),
        unit: z.enum(UNIT_VALUES),
        costPrice: z.number().nonnegative("Cost price must be 0 or more"),
        sellingPrice: z.number().nonnegative("Selling price must be 0 or more"),
        reorderPoint: z.number().int().nonnegative(),
        reorderQty: z.number().int().nonnegative(),
        imageUrl: z
            .url()
            .optional()
            .nullable()
            .refine(
                // biome-ignore lint/style/noNonNullAssertion: Ignore
                (value) => isBlank(value) || z.url().safeParse(value!).success,
                { message: "Enter a valid image URL" }
            ),
        isActive: z.boolean(),
    })
    .refine((data) => data.sellingPrice >= data.costPrice, {
        error: "Selling price must be greater than or equal to cost price",
        path: ["sellingPrice"],
    });
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const createProductServerSchema = z
    .object({
        name: z.string().min(1, "Product name is required"),
        description: z.string().optional().nullable(),
        categoryId: z.string().min(1, "Category is required"),
        supplierId: z.preprocess(
            emptyStringToNull,
            z.string().optional().nullable()
        ),
        unit: z.enum(UNIT_VALUES),
        costPrice: z.number().nonnegative("Cost price must be 0 or more"),
        sellingPrice: z.number().nonnegative("Selling price must be 0 or more"),
        reorderPoint: z.number().int().nonnegative(),
        reorderQty: z.number().int().nonnegative(),
        isActive: z.boolean(),
        imageUrl: z.preprocess(
            (val) => (val === "" || val == null ? undefined : val),
            z.url("Enter a valid image URL").optional()
        ),
    })
    .refine((data) => data.sellingPrice >= data.costPrice, {
        error: "Selling price must be greater than or equal to cost price",
        path: ["sellingPrice"],
    });

export const updateProductSchema = createProductSchema
    .extend({
        id: z.cuid2(),
    })
    .transform((data) => ({
        ...data,
        imageUrl:
            data.imageUrl === "" || data.imageUrl === null
                ? undefined
                : data.imageUrl,
    }));
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const archiveProductSchema = getProductSchema;
export type ArchiveProductInput = z.infer<typeof archiveProductSchema>;

export const getProductMovementsSchema = z.object({
    id: z.cuid2(),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
});
export type GetProductMovementsInput = z.infer<
    typeof getProductMovementsSchema
>;

export const getProductAuditLogsSchema = z.object({
    id: z.cuid2(),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
});
export type GetProductAuditLogsInput = z.infer<
    typeof getProductAuditLogsSchema
>;
