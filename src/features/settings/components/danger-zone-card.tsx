import { revalidateLogic } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "#/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "#/components/ui/dialog";
import { FieldGroup } from "#/components/ui/field";
import { useAppForm } from "#/hooks/use-form";
import { authClient } from "#/lib/auth-client";
import { type DeleteAccountInput, deleteAccountSchema } from "../schema";

export default function DangerZoneCard() {
    const [open, setOpen] = useState(false);

    return (
        <Card className="border-destructive/50">
            <CardHeader>
                <CardTitle className="text-destructive">Danger zone</CardTitle>
                <CardDescription>
                    Permanently delete your account and all of its access. This
                    can't be undone.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => setOpen(true)} variant="destructive">
                    Delete my account
                </Button>
            </CardContent>

            <Dialog onOpenChange={setOpen} open={open}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete your account?</DialogTitle>
                        <DialogDescription>
                            This permanently removes your account. Enter your
                            password to confirm.
                        </DialogDescription>
                    </DialogHeader>

                    {open && (
                        <DeleteAccountForm onCancel={() => setOpen(false)} />
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}

function DeleteAccountForm({ onCancel }: { onCancel: () => void }) {
    const router = useRouter();

    const defaultValues: DeleteAccountInput = { password: "" };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            await authClient.deleteUser({
                password: value.password,
                fetchOptions: {
                    onError: ({ error }) => {
                        toast.error(
                            error.message ?? "Failed to delete account"
                        );
                    },
                    onSuccess: () => {
                        toast.success("Account deleted");
                        router.navigate({ to: "/" });
                    },
                },
            });
        },
        validators: { onDynamic: deleteAccountSchema },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
            }}
        >
            <FieldGroup>
                <form.AppField name="password">
                    {(field) => (
                        <field.FormPassword label="Password" placeholder="Enter your password" />
                    )}
                </form.AppField>

                <DialogFooter>
                    <Button onClick={onCancel} type="button" variant="outline">
                        Cancel
                    </Button>
                    
                    <form.AppForm>
                        <form.SubmitButton
                            label="Permanently delete account"
                            variant="destructive"
                        />
                    </form.AppForm>
                </DialogFooter>
            </FieldGroup>
        </form>
    );
}
