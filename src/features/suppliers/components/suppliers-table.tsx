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
import { Input } from "#/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table";
import { deleteSupplier } from "../functions";
import SupplierFormDialog from "./supplier-form-dialog";

interface Supplier {
    _count: { products: number; purchaseOrders: number };
    address: string | null;
    contactName: string | null;
    email: string | null;
    id: string;
    name: string;
    notes: string | null;
    phone: string | null;
}

interface SuppliersTableProps {
    onPageChange: (page: number) => void;
    onSearchChange: (search: string) => void;
    page: number;
    pageCount: number;
    search: string;
    suppliers: Supplier[];
}

export default function SuppliersTable({
    suppliers,
    search,
    onSearchChange,
    page,
    pageCount,
    onPageChange,
}: SuppliersTableProps) {
    const queryClient = useQueryClient();

    const [formOpen, setFormOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<
        Supplier | undefined
    >();
    const [deletingSupplier, setDeletingSupplier] = useState<
        Supplier | undefined
    >();

    const openCreate = () => {
        setEditingSupplier(undefined);
        setFormOpen(true);
    };

    const openEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingSupplier) {
            return;
        }
        try {
            await deleteSupplier({ data: { id: deletingSupplier.id } });
            toast.success("Supplier deleted");
            await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to delete supplier"
            );
        } finally {
            setDeletingSupplier(undefined);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <Input
                    className="max-w-sm"
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search suppliers…"
                    value={search}
                />
                <Button onClick={openCreate}>
                    <IconPlus className="size-4" />
                    New supplier
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Products</TableHead>
                        <TableHead className="w-0" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {suppliers.length === 0 ? (
                        <TableRow>
                            <TableCell
                                className="py-8 text-center text-muted-foreground"
                                colSpan={6}
                            >
                                No suppliers found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        suppliers.map((supplier) => (
                            <TableRow key={supplier.id}>
                                <TableCell>{supplier.name}</TableCell>
                                <TableCell>
                                    {supplier.contactName ?? "—"}
                                </TableCell>
                                <TableCell>{supplier.email ?? "—"}</TableCell>
                                <TableCell>{supplier.phone ?? "—"}</TableCell>
                                <TableCell className="text-right">
                                    {supplier._count.products}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            onClick={() => openEdit(supplier)}
                                            size="icon"
                                            variant="ghost"
                                        >
                                            <IconPencil className="size-4" />
                                        </Button>
                                        <Button
                                            disabled={
                                                supplier._count.products > 0 ||
                                                supplier._count.purchaseOrders >
                                                    0
                                            }
                                            onClick={() =>
                                                setDeletingSupplier(supplier)
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

            <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                    Page {page} of {Math.max(pageCount, 1)}
                </p>
                <div className="flex gap-2">
                    <Button
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                        size="sm"
                        variant="outline"
                    >
                        Previous
                    </Button>
                    <Button
                        disabled={page >= pageCount}
                        onClick={() => onPageChange(page + 1)}
                        size="sm"
                        variant="outline"
                    >
                        Next
                    </Button>
                </div>
            </div>

            <SupplierFormDialog
                onOpenChange={setFormOpen}
                open={formOpen}
                supplier={editingSupplier}
            />

            <AlertDialog
                onOpenChange={(open) => !open && setDeletingSupplier(undefined)}
                open={Boolean(deletingSupplier)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete supplier?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "
                            {deletingSupplier?.name}". This can't be undone.
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
