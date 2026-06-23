import { z } from "zod";

const isBlank = (value: string | null | undefined) =>
    value === null || value === undefined || value.trim() === "";

export const createCategorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z
        .string()
        .min(1, "Code is required")
        .max(20, "Code must be 20 characters or fewer")
        .regex(
            /^[A-Za-z0-9_-]+$/,
            "Code may only contain letters, numbers, hyphens, and underscores"
        ),
    description: z.string().optional().nullable(),
    parentId: z.string().optional().nullable(),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.extend({
    id: z.cuid2(),
});
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const deleteCategorySchema = z.object({ id: z.cuid2() });
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;