import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-hot-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table";
import { deleteWarehouse } from "../functions";
import WarehouseFormDialog from "./warehouse-form-dialog";

interface WarehouseWithCounts {
    _count: {
        inventoryItems: number;
        stockMovements: number;
        transfersFrom: number;
        transfersTo: number;
    };
    id: string;
    location: string | null;
    name: string;
}

interface WarehousesTableProps {
    warehouses: WarehouseWithCounts[];
}

export default function WarehousesTable({ warehouses }: WarehousesTableProps) {
    const queryClient = useQueryClient();

    const [formOpen, setFormOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<
        WarehouseWithCounts | undefined
    >();
    const [deletingWarehouse, setDeletingWarehouse] = useState<
        WarehouseWithCounts | undefined
    >();

    const openCreate = () => {
        setEditingWarehouse(undefined);
        setFormOpen(true);
    };

    const openEdit = (warehouse: WarehouseWithCounts) => {
        setEditingWarehouse(warehouse);
        setFormOpen(true);
    };

    const isInUse = (warehouse: WarehouseWithCounts) =>
        warehouse._count.inventoryItems > 0 ||
        warehouse._count.stockMovements > 0 ||
        warehouse._count.transfersFrom > 0 ||
        warehouse._count.transfersTo > 0;

    const handleDelete = async () => {
        if (!deletingWarehouse) {
            return;
        }

        try {
            await deleteWarehouse({ data: { id: deletingWarehouse.id } });
            toast.success("Warehouse deleted");
            await queryClient.invalidateQueries({ queryKey: ["warehouses"] });
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to delete warehouse"
            );
        } finally {
            setDeletingWarehouse(undefined);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={openCreate}>
                    <IconPlus className="size-4" />
                    New warehouse
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">
                            Inventory lines
                        </TableHead>
                        <TableHead className="w-0" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {warehouses.length === 0 ? (
                        <TableRow>
                            <TableCell
                                className="py-8 text-center text-muted-foreground"
                                colSpan={4}
                            >
                                No warehouses yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        warehouses.map((warehouse) => (
                            <TableRow key={warehouse.id}>
                                <TableCell>{warehouse.name}</TableCell>
                                <TableCell>
                                    {warehouse.location ?? "—"}
                                </TableCell>
                                <TableCell className="text-right">
                                    {warehouse._count.inventoryItems}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            aria-label={`Edit warehouse ${warehouse.name}`}
                                            onClick={() => openEdit(warehouse)}
                                            size="icon"
                                            variant="ghost"
                                        >
                                            <IconPencil className="size-4" />
                                        </Button>
                                        <Button
                                            aria-label={`Delete warehouse ${warehouse.name}`}
                                            disabled={isInUse(warehouse)}
                                            onClick={() =>
                                                setDeletingWarehouse(warehouse)
                                            }
                                            size="icon"
                                            variant="ghost"
                                        >
                                            <IconTrash className="size-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <WarehouseFormDialog
                onOpenChange={setFormOpen}
                open={formOpen}
                warehouse={editingWarehouse}
            />

            <AlertDialog
                onOpenChange={(open) =>
                    !open && setDeletingWarehouse(undefined)
                }
                open={Boolean(deletingWarehouse)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete warehouse?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "
                            {deletingWarehouse?.name}". This can't be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
