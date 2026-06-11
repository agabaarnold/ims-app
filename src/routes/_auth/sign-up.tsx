import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import SignUpForm from "#/features/auth/components/sign-up-form";

export const Route = createFileRoute("/_auth/sign-up")({
    component: SignUpPage,
    validateSearch: z.object({
        redirect: z
            .string()
            .refine(
                (value) => value.startsWith("/") && !value.startsWith("//"),
                "Invalid redirect path"
            )
            .optional(),
    }),
});

function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <SignUpForm />
        </div>
    );
}
