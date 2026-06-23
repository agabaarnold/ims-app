import { revalidateLogic } from "@tanstack/react-form";
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
import { type ChangePasswordInput, changePasswordSchema } from "../schema";

export default function ChangePasswordCard() {
    const defaultValues: ChangePasswordInput = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            await authClient.changePassword({
                currentPassword: value.currentPassword,
                newPassword: value.newPassword,
                revokeOtherSessions: true,
                fetchOptions: {
                    onError: ({ error }) => {
                        toast.error(
                            error.message ?? "Failed to change password"
                        );
                    },
                    onSuccess: () => {
                        toast.success(
                            "Password updated. Other devices have been signed out."
                        );
                        form.reset();
                    },
                },
            });
        },
        validators: { onDynamic: changePasswordSchema },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                    Changing your password signs you out of every other device.
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
                        <form.AppField name="currentPassword">
                            {(field) => (
                                <field.FormPassword
                                    label="Current password"
                                    placeholder="Enter your current password"
                                />
                            )}
                        </form.AppField>

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
                                    label="Confirm new password"
                                    placeholder="Enter your new password again"
                                />
                            )}
                        </form.AppField>

                        <div className="flex justify-end">
                            <form.AppForm>
                                <form.SubmitButton label="Update password" />
                            </form.AppForm>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
