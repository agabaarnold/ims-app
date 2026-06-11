import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import SignInForm from "#/features/auth/components/sign-in-form";

export const Route = createFileRoute("/_auth/sign-in")({
    component: SignInPage,
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

function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <SignInForm />
        </div>
    );
}
