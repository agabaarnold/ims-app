import { revalidateLogic } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card";
import { FieldDescription, FieldGroup } from "#/components/ui/field";
import { useAppForm } from "#/hooks/use-form";
import { authClient } from "#/lib/auth-client";
import type { ForgotPasswordInput } from "../schema";
import { forgotPasswordShema } from "../schema";

export default function ForgotPasswordForm() {
    const defaultValues: ForgotPasswordInput = { email: "" };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            await authClient.requestPasswordReset({
                email: value.email,
                fetchOptions: {
                    onError: ({ error }) => {
                        toast.error(error.message);
                    },
                    onSuccess: () => {
                        toast.success("Password reset email sent successfully");
                    },
                },
                redirectTo: `${window.location.origin}/reset-password`,
            });
        },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
        validators: { onSubmit: forgotPasswordShema },
    });

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="font-semibold text-xl">
                    Request Password Reset
                </CardTitle>
                <CardDescription>
                    Enter your email address below to receive password reset
                    instructions
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    <FieldGroup>
                        <form.AppField name="email">
                            {(field) => (
                                <field.FormInput
                                    label="Email address"
                                    placeholder="Enter your email address"
                                    type="email"
                                />
                            )}
                        </form.AppField>

                        <form.AppForm>
                            <form.SubmitButton label="Submit" />
                        </form.AppForm>

                        <FieldDescription className="text-center">
                            Remembered your password?{" "}
                            <Link to="/sign-in">Login</Link> here.
                        </FieldDescription>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
