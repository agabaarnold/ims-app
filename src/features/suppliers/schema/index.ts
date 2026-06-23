import { z } from "zod";

const isBlank = (value: string | null | undefined) =>
    value === null || value === undefined || value.trim() === "";

export const createSupplierSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    contactName: z.string().optional().nullable(),
    email: z
        .string()
        .optional()
        .nullable()
        .refine(
            // biome-ignore lint/style/noNonNullAssertion: Ignore
            (value) => isBlank(value) || z.email().safeParse(value!).success,
            {
                message: "Enter a valid email address",
            }
        ),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export const updateSupplierSchema = createSupplierSchema.extend({
    id: z.cuid2(),
});
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;

export const deleteSupplierSchema = z.object({ id: z.cuid2() });
export type DeleteSupplierInput = z.infer<typeof deleteSupplierSchema>;

const MAX_PAGE_SIZE = 100;

export const getSuppliersSchema = z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE),
    search: z.string().default(""),
});
export type GetSuppliersInput = z.infer<typeof getSuppliersSchema>;
