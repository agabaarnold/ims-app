import { revalidateLogic } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
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
import { createSupplier, updateSupplier } from "../functions";
import {
    type CreateSupplierInput,
    createSupplierSchema,
    updateSupplierSchema,
} from "../schema";

interface SupplierWithCounts {
    address: string | null;
    contactName: string | null;
    email: string | null;
    id: string;
    name: string;
    notes: string | null;
    phone: string | null;
}

interface SupplierFormDialogProps {
    onOpenChange: (open: boolean) => void;
    open: boolean;
    supplier?: SupplierWithCounts;
}

export default function SupplierFormDialog({
    open,
    onOpenChange,
    supplier,
}: SupplierFormDialogProps) {
    const isEditing = Boolean(supplier);

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit supplier" : "New supplier"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update this supplier's details."
                            : "Add a new supplier to your catalog."}
                    </DialogDescription>
                </DialogHeader>

                {open && (
                    <SupplierForm
                        key={supplier?.id ?? "new"}
                        onDone={() => onOpenChange(false)}
                        supplier={supplier}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function SupplierForm({
    supplier,
    onDone,
}: {
    supplier?: SupplierWithCounts;
    onDone: () => void;
}) {
    const queryClient = useQueryClient();
    const isEditing = Boolean(supplier);

    const defaultValues: CreateSupplierInput = {
        name: supplier?.name ?? "",
        contactName: supplier?.contactName ?? "",
        email: supplier?.email ?? "",
        phone: supplier?.phone ?? "",
        address: supplier?.address ?? "",
        notes: supplier?.notes ?? "",
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                const payload = {
                    name: value.name,
                    contactName: value.contactName?.trim() || null,
                    email: value.email?.trim() || null,
                    phone: value.phone?.trim() || null,
                    address: value.address?.trim() || null,
                    notes: value.notes?.trim() || null,
                };

                if (isEditing && supplier) {
                    await updateSupplier({
                        data: { ...payload, id: supplier.id },
                    });
                    toast.success("Supplier updated");
                } else {
                    await createSupplier({ data: payload });
                    toast.success("Supplier created");
                }

                await queryClient.invalidateQueries({
                    queryKey: ["suppliers"],
                });
                onDone();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to save supplier"
                );
            }
        },
        validators: {
            onDynamic: isEditing ? updateSupplierSchema : createSupplierSchema,
        },
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
                                label="Name"
                                placeholder="Acme Supplies"
                                type="text"
                            />
                        )}
                    </form.AppField>

                    <form.AppField name="contactName">
                        {(field) => (
                            <field.FormInput
                                label="Contact name"
                                placeholder="Jane Doe"
                                type="text"
                            />
                        )}
                    </form.AppField>

                    <form.AppField name="email">
                        {(field) => (
                            <field.FormInput
                                label="Email"
                                placeholder="orders@acme.com"
                                type="email"
                            />
                        )}
                    </form.AppField>

                    <form.AppField name="phone">
                        {(field) => (
                            <field.FormInput
                                label="Phone"
                                placeholder="+256 700 000000"
                                type="text"
                            />
                        )}
                    </form.AppField>
                </div>

                <form.AppField name="address">
                    {(field) => (
                        <field.FormInput
                            label="Address"
                            placeholder="Street, city"
                            type="text"
                        />
                    )}
                </form.AppField>

                <form.AppField name="notes">
                    {(field) => (
                        <field.FormTextArea
                            label="Notes"
                            placeholder="Payment terms, lead times, etc."
                        />
                    )}
                </form.AppField>

                <DialogFooter>
                    <Button onClick={onDone} type="button" variant="outline">
                        Cancel
                    </Button>
                    <form.AppForm>
                        <form.SubmitButton
                            label={
                                isEditing ? "Save changes" : "Create supplier"
                            }
                        />
                    </form.AppForm>
                </DialogFooter>
            </FieldGroup>
        </form>
    );
}
