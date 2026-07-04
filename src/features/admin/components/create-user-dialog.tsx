import { revalidateLogic } from "@tanstack/react-form";
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
import { passwordSchema } from "#/features/auth/schema";
import { useAppForm } from "#/hooks/use-form";
import { authClient } from "#/lib/auth-client";

const adminClient = authClient.admin;

const ROLES = [
    { value: "staff", label: "Staff" },
    { value: "manager", label: "Manager" },
    { value: "admin", label: "Admin" },
] as const;

const createUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Enter a valid email address"),
    password: passwordSchema,
    role: z.enum(["staff", "manager", "admin"]),
});
type CreateUserInput = z.infer<typeof createUserSchema>;

interface CreateUserDialogProps {
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    open: boolean;
}

export default function CreateUserDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateUserDialogProps) {
    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create user</DialogTitle>
                    <DialogDescription>
                        Add a new staff member to the system.
                    </DialogDescription>
                </DialogHeader>

                {open && (
                    <CreateUserForm
                        key="new"
                        onClose={() => onOpenChange(false)}
                        onSuccess={() => {
                            onSuccess();
                            onOpenChange(false);
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function CreateUserForm({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const defaultValues: CreateUserInput = {
        name: "",
        email: "",
        password: "",
        role: "staff",
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                const { error } = await adminClient.createUser({
                    name: value.name,
                    email: value.email,
                    password: value.password,
                    role: value.role,
                });
                if (error) {
                    throw new Error(error.message);
                }

                toast.success(`User ${value.name} created`);
                onSuccess();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to create user"
                );
            }
        },
        validators: { onDynamic: createUserSchema },
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
                <div className="grid gap-4 sm:grid-cols-2">
                    <form.AppField name="name">
                        {(field) => (
                            <field.FormInput
                                label="Full name"
                                placeholder="Jane Doe"
                                type="text"
                            />
                        )}
                    </form.AppField>

                    <form.AppField name="role">
                        {(field) => (
                            <field.FormSelect
                                getOptionLabel={(r) => r.label}
                                getOptionValue={(r) => r.value}
                                label="Role"
                                options={ROLES}
                                placeholder="Select role"
                            />
                        )}
                    </form.AppField>
                </div>

                <form.AppField name="email">
                    {(field) => (
                        <field.FormInput
                            label="Email address"
                            placeholder="jane@company.com"
                            type="email"
                        />
                    )}
                </form.AppField>

                <form.AppField name="password">
                    {(field) => (
                        <field.FormPassword
                            label="Initial password"
                            placeholder="Min. 8 characters"
                        />
                    )}
                </form.AppField>

                <DialogFooter>
                    <Button onClick={onClose} type="button" variant="outline">
                        Cancel
                    </Button>

                    <form.AppForm>
                        <form.SubmitButton label="Create user" />
                    </form.AppForm>
                </DialogFooter>
            </FieldGroup>
        </form>
    );
}
