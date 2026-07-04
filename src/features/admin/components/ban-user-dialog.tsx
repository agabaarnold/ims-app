import { revalidateLogic } from "@tanstack/react-form";
import type { UserWithRole } from "better-auth/plugins";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Button } from "#/components/ui/button";
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

const adminClient = authClient.admin;

const banUserSchema = z.object({
    banReason: z.string().min(1, "Please enter a reason for the ban"),
    // Duration in days — 0 means permanent
    banDays: z.number().int().min(0),
});
type BanUserInput = z.infer<typeof banUserSchema>;

interface BanUserDialogProps {
    onClose: () => void;
    onSuccess: () => void;
    user: UserWithRole | undefined;
}

export default function BanUserDialog({
    user,
    onClose,
    onSuccess,
}: BanUserDialogProps) {
    return (
        <Dialog
            onOpenChange={(open) => !open && onClose()}
            open={Boolean(user)}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ban {user?.name}?</DialogTitle>
                    <DialogDescription>
                        This will immediately prevent them from signing in and
                        revoke all their active sessions.
                    </DialogDescription>
                </DialogHeader>
                {user && (
                    <BanForm
                        key={user.id}
                        onClose={onClose}
                        onSuccess={onSuccess}
                        userId={user.id}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function BanForm({
    userId,
    onClose,
    onSuccess,
}: {
    userId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const defaultValues: BanUserInput = { banReason: "", banDays: 0 };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                const { error } = await adminClient.banUser({
                    userId,
                    banReason: value.banReason,
                    // Convert days to seconds; 0 = permanent (don't pass banExpiresIn)
                    ...(value.banDays > 0
                        ? { banExpiresIn: value.banDays * 24 * 60 * 60 }
                        : {}),
                });
                if (error) {
                    throw new Error(error.message);
                }
                toast.success("User banned");
                onSuccess();
                onClose();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to ban user"
                );
            }
        },
        validators: { onDynamic: banUserSchema },
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
                <form.AppField name="banReason">
                    {(field) => (
                        <field.FormTextArea
                            label="Reason"
                            placeholder="Explain why this user is being banned"
                        />
                    )}
                </form.AppField>

                <form.AppField name="banDays">
                    {(field) => (
                        <field.FormNumberInput
                            label="Duration (days)"
                            min="0"
                            placeholder="0"
                            step="1"
                        />
                    )}
                </form.AppField>

                <p className="text-muted-foreground text-xs">
                    Set duration to 0 for a permanent ban.
                </p>

                <DialogFooter>
                    <Button onClick={onClose} type="button" variant="outline">
                        Cancel
                    </Button>
                    <form.AppForm>
                        <form.SubmitButton label="Ban user" />
                    </form.AppForm>
                </DialogFooter>
            </FieldGroup>
        </form>
    );
}
