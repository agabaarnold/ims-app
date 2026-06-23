import { revalidateLogic } from "@tanstack/react-form";
import { useState } from "react";
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
import { type ChangeEmailInput, changeEmailSchema } from "../schema";

interface EmailChangeCardProps {
    currentEmail: string;
    emailVerified: boolean;
}

export default function EmailChangeCard({
    currentEmail,
    emailVerified,
}: EmailChangeCardProps) {
    const [pendingEmail, setPendingEmail] = useState<string | null>(null);

    const defaultValues: ChangeEmailInput = { newEmail: "" };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                const { error } = await authClient.changeEmail({
                    newEmail: value.newEmail,
                    callbackURL: window.location.pathname,
                });
                if (error) {
                    toast.error(error.message || "Failed to change email");
                }
                setPendingEmail(value.newEmail);
                toast.success(
                    "Check your new email inbox to confirm the change"
                );
                form.reset();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to change email"
                );
            }
        },
        validators: { onDynamic: changeEmailSchema },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Email address</CardTitle>
                <CardDescription>
                    Current: <span className="font-medium">{currentEmail}</span>{" "}
                    {!emailVerified && (
                        <span className="text-destructive">(unverified)</span>
                    )}
                </CardDescription>
            </CardHeader>

            <CardContent>
                {pendingEmail && (
                    <p className="mb-4 rounded-md bg-muted p-3 text-muted-foreground text-sm">
                        A confirmation link was sent to{" "}
                        <strong>{pendingEmail}</strong>. Your email won't change
                        until you click it.
                    </p>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    <FieldGroup>
                        <form.AppField name="newEmail">
                            {(field) => (
                                <field.FormInput
                                    label="New email address"
                                    placeholder="you@company.com"
                                    type="email"
                                />
                            )}
                        </form.AppField>

                        <div className="flex justify-end">
                            <form.AppForm>
                                <form.SubmitButton label="Send confirmation" />
                            </form.AppForm>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
