import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;
const NAME_MIN_LENGTH = 4;

const whiteSpaceRegex = /\s/u;

export const passwordSchema = z
    .string()
    .min(
        PASSWORD_MIN_LENGTH,
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
    )
    .max(128, "Password must not exceed 128 characters")
    .regex(/[A-Z]/u, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/u, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/u, "Password must contain at least one number")
    .regex(
        /[^A-Za-z0-9\s]/u,
        "Password must contain at least one special character"
    )
    .refine(
        (v) => !whiteSpaceRegex.test(v),
        "Password must not contain whitespace"
    );

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    email: z.email(),
    name: z
        .string()
        .min(
            NAME_MIN_LENGTH,
            `Name must be at least ${NAME_MIN_LENGTH} characters`
        ),
    password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
    email: z.email(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
    .object({
        confirmPassword: passwordSchema,
        newPassword: passwordSchema,
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
