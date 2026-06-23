import { z } from "zod";

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        error: "Passwords don't match",
        path: ["confirmPassword"],
    });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const deleteAccountSchema = z.object({
    password: z.string().min(1, "Enter your password to confirm"),
});
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;