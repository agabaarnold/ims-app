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
import { createCustomer, updateCustomer } from "../functions";
import {
    type CreateCustomerInput,
    type Customer,
    createCustomerSchema,
    updateCustomerSchema,
} from "../schema";

interface CustomerFormDialogProps {
    customer?: Customer;
    onOpenChange: (open: boolean) => void;
    open: boolean;
}

export default function CustomerFormDialog({
    open,
    onOpenChange,
    customer,
}: CustomerFormDialogProps) {
    const isEditing = Boolean(customer);
    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit customer" : "New customer"}
                    </DialogTitle>

                    <DialogDescription>
                        {isEditing
                            ? "Update this customer's details."
                            : "Add a new customer to your records."}
                    </DialogDescription>
                </DialogHeader>

                {open && (
                    <CustomerForm
                        customer={customer}
                        key={customer?.id ?? "new"}
                        onDone={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function CustomerForm({
    customer,
    onDone,
}: {
    customer?: Customer;
    onDone: () => void;
}) {
    const queryClient = useQueryClient();
    const isEditing = Boolean(customer);

    const defaultValues: CreateCustomerInput = {
        name: customer?.name ?? "",
        email: customer?.email ?? "",
        phone: customer?.phone ?? "",
        address: customer?.address ?? "",
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                const payload = {
                    name: value.name,
                    email: value.email?.trim() || null,
                    phone: value.phone?.trim() || null,
                    address: value.address?.trim() || null,
                };
                if (isEditing && customer) {
                    await updateCustomer({
                        data: { ...payload, id: customer.id },
                    });
                    toast.success("Customer updated");
                } else {
                    await createCustomer({ data: payload });
                    toast.success("Customer created");
                }
                await queryClient.invalidateQueries({
                    queryKey: ["customers"],
                });
                onDone();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to save customer"
                );
            }
        },
        validators: {
            onDynamic: isEditing ? updateCustomerSchema : createCustomerSchema,
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
                <form.AppField name="name">
                    {(field) => (
                        <field.FormInput
                            label="Name"
                            placeholder="Acme Ltd."
                            type="text"
                        />
                    )}
                </form.AppField>

                <div className="grid gap-4 sm:grid-cols-2">
                    <form.AppField name="email">
                        {(field) => (
                            <field.FormInput
                                label="Email"
                                placeholder="billing@acme.com"
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

                <DialogFooter>
                    <Button onClick={onDone} type="button" variant="outline">
                        Cancel
                    </Button>

                    <form.AppForm>
                        <form.SubmitButton
                            label={
                                isEditing ? "Save changes" : "Create customer"
                            }
                        />
                    </form.AppForm>
                </DialogFooter>
            </FieldGroup>
        </form>
    );
}
