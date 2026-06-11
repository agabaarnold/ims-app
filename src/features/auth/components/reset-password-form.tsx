import { revalidateLogic } from "@tanstack/react-form";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { useAppForm } from "#/hooks/use-form";
import { authClient } from "#/lib/auth-client";
import type { ResetPasswordInput } from "../schema";
import { resetPasswordSchema } from "../schema";

export default function ResetPasswordForm(){
    const navigate = useNavigate();
    const search = useSearch({ from: "/_auth/reset-password" });

    const defaultValues: ResetPasswordInput = {
        confirmPassword: "",
        newPassword: "",
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            await authClient.resetPassword({
                fetchOptions: {
                    onError: ({ error }) => {
                        toast.error(error.message);
                    },
                    onSuccess: () => {
                        toast.success("Password reset successfully");
                        navigate({ replace: true, to: "/" });
                    },
                },
                newPassword: value.newPassword,
                token: search?.token,
            });
        },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
        validators: { onSubmit: resetPasswordSchema },
    });

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="font-semibold text-xl">
                    Reset your password
                </CardTitle>
                <CardDescription>Enter your new password</CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    <FieldGroup>
                        <form.AppField name="newPassword">
                            {(field) => (
                                <field.FormPassword
                                    label="New password"
                                    placeholder="Enter your new password"
                                />
                            )}
                        </form.AppField>

                        <form.AppField name="confirmPassword">
                            {(field) => (
                                <field.FormPassword
                                    label="Confirm password"
                                    placeholder="Confirm your password"
                                />
                            )}
                        </form.AppField>

                        <form.AppForm>
                            <form.SubmitButton label="Reset password" />
                        </form.AppForm>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
