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
import { confirmOrder } from "../functions";
import { type ConfirmOrderInput, confirmOrderSchema } from "../schema";

interface Warehouse {
    id: string;
    name: string;
}

interface ConfirmOrderDialogProps {
    onOpenChange: (open: boolean) => void;
    open: boolean;
    orderId: string;
    warehouses: Warehouse[];
}

export default function ConfirmOrderDialog({
    open,
    onOpenChange,
    orderId,
    warehouses,
}: ConfirmOrderDialogProps) {
    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm order</DialogTitle>

                    <DialogDescription>
                        Select the warehouse to fulfill this order from. Stock
                        will be decremented immediately on confirmation.
                    </DialogDescription>
                </DialogHeader>

                {open && (
                    <ConfirmOrderForm
                        key={orderId}
                        onDone={() => onOpenChange(false)}
                        orderId={orderId}
                        warehouses={warehouses}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function ConfirmOrderForm({
    orderId,
    warehouses,
    onDone,
}: {
    orderId: string;
    warehouses: Warehouse[];
    onDone: () => void;
}) {
    const queryClient = useQueryClient();

    const defaultValues: ConfirmOrderInput = {
        id: orderId,
        warehouseId: warehouses[0]?.id ?? "",
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                await confirmOrder({ data: value });
                toast.success("Order confirmed — stock decremented");
                await queryClient.invalidateQueries({
                    queryKey: ["orders", orderId],
                });
                onDone();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to confirm order"
                );
            }
        },
        validators: { onDynamic: confirmOrderSchema },
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
                <form.AppField name="warehouseId">
                    {(field) => (
                        <field.FormSelect
                            getOptionLabel={(w: Warehouse) => w.name}
                            getOptionValue={(w: Warehouse) => w.id}
                            label="Fulfill from warehouse"
                            options={warehouses}
                            placeholder="Select a warehouse"
                        />
                    )}
                </form.AppField>

                <DialogFooter>
                    <Button onClick={onDone} type="button" variant="outline">
                        Cancel
                    </Button>

                    <form.AppForm>
                        <form.SubmitButton label="Confirm order" />
                    </form.AppForm>
                </DialogFooter>
            </FieldGroup>
        </form>
    );
}
