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
import { createWarehouse, updateWarehouse } from "../functions";
import { type CreateWarehouseInput, createWarehouseSchema } from "../schema";

interface Warehouse {
    id: string;
    location: string | null;
    name: string;
}

interface WarehouseFormDialogProps {
    onOpenChange: (open: boolean) => void;
    open: boolean;
    warehouse?: Warehouse;
}

export default function WarehouseFormDialog({
    open,
    onOpenChange,
    warehouse,
}: WarehouseFormDialogProps) {
    const isEditing = Boolean(warehouse);

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit warehouse" : "New warehouse"}
                    </DialogTitle>

                    <DialogDescription>
                        {isEditing
                            ? "Update this warehouse's details."
                            : "Add a new warehouse or storage location."}
                    </DialogDescription>
                </DialogHeader>

                {open && (
                    <WarehouseForm
                        key={warehouse?.id ?? "new"}
                        onDone={() => onOpenChange(false)}
                        warehouse={warehouse}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function WarehouseForm({
    warehouse,
    onDone,
}: {
    warehouse?: Warehouse;
    onDone: () => void;
}) {
    const queryClient = useQueryClient();
    const isEditing = Boolean(warehouse);

    const defaultValues: CreateWarehouseInput = {
        name: warehouse?.name ?? "",
        location: warehouse?.location ?? "",
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                const payload = {
                    name: value.name,
                    location: value.location?.trim() || null,
                };

                if (isEditing && warehouse) {
                    await updateWarehouse({
                        data: { ...payload, id: warehouse.id },
                    });
                    toast.success("Warehouse updated");
                } else {
                    await createWarehouse({ data: payload });
                    toast.success("Warehouse created");
                }

                await queryClient.invalidateQueries({
                    queryKey: ["warehouses"],
                });
                onDone();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to save warehouse"
                );
            }
        },
        validators: {
            onDynamic: createWarehouseSchema,
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
                            placeholder="Main warehouse"
                            type="text"
                        />
                    )}
                </form.AppField>

                <form.AppField name="location">
                    {(field) => (
                        <field.FormInput
                            label="Location"
                            placeholder="Plot 12, Industrial Area, Kampala"
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
                                isEditing ? "Save changes" : "Create warehouse"
                            }
                        />
                    </form.AppForm>
                </DialogFooter>
            </FieldGroup>
        </form>
    );
}
