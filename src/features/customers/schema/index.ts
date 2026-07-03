import { z } from "zod";

export interface Customer {
    address: string | null;
    email: string | null;
    id: string;
    name: string;
    phone: string | null;
}

export interface CustomerWithOrderCount extends Customer {
    _count: { orders: number };
}

const isBlank = (v: string | null | undefined) =>
    v === null || v === undefined || v.trim() === "";

export const createCustomerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z
        .string()
        .optional()
        .nullable()
        // biome-ignore lint/style/noNonNullAssertion: Ignore this because we are checking for null and undefined in the refine method
        .refine((v) => isBlank(v) || z.email().safeParse(v!).success, {
            message: "Enter a valid email address",
        }),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
});
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.extend({
    id: z.cuid2(),
});
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export const deleteCustomerSchema = z.object({ id: z.cuid2() });
export type DeleteCustomerInput = z.infer<typeof deleteCustomerSchema>;

export const getCustomersSchema = z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1).max(100),
    search: z.string().default(""),
});
export type GetCustomersInput = z.infer<typeof getCustomersSchema>;
