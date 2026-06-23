import { z } from "zod";

const isBlank = (value: string | null | undefined) =>
    value === null || value === undefined || value.trim() === "";

export const updateProfileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    image: z
        .string()
        .optional()
        .nullable()
        .refine(
            // biome-ignore lint/style/noNonNullAssertion: Ignore
            (value) => isBlank(value) || z.url().safeParse(value!).success,
            {
                message: "Enter a valid image URL",
            }
        ),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changeEmailSchema = z.object({
    newEmail: z.email("Enter a valid email address"),
});
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;