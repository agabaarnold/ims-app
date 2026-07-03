import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { type Dispatch, type SetStateAction, useState } from "react";
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
import { deleteCustomer } from "../functions";
import CustomerFormDialog from "./customer-form-dialog";

interface Customer {
    _count: { orders: number };
    address: string | null;
    email: string | null;
    id: string;
    name: string;
    phone: string | null;
}

interface CustomersTableProps {
    customers: Customer[];
    onPageChange: (p: number) => void;
    page: number;
    pageCount: number;
    search: string;
    setSearchInput: Dispatch<SetStateAction<string>>;
}

export default function CustomersTable({
    customers,
    search,
    setSearchInput,
    page,
    pageCount,
    onPageChange,
}: CustomersTableProps) {
    const queryClient = useQueryClient();
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Customer | undefined>();
    const [deleting, setDeleting] = useState<Customer | undefined>();

    const openCreate = () => {
        setEditing(undefined);
        setFormOpen(true);
    };
    const openEdit = (c: Customer) => {
        setEditing(c);
        setFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deleting) {
            return;
        }
        try {
            await deleteCustomer({ data: { id: deleting.id } });
            toast.success("Customer deleted");
            await queryClient.invalidateQueries({ queryKey: ["customers"] });
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to delete"
            );
        } finally {
            setDeleting(undefined);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <Input
                    aria-label="Search customers"
                    className="max-w-sm"
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search customers…"
                    value={search}
                />

                <Button onClick={openCreate}>
                    <IconPlus className="size-4" />
                    New customer
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="w-0" />
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {customers.length === 0 ? (
                        <TableRow>
                            <TableCell
                                className="py-8 text-center text-muted-foreground"
                                colSpan={5}
                            >
                                No customers found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        customers.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell className="font-medium">
                                    {c.name}
                                </TableCell>
                                <TableCell>{c.email ?? "—"}</TableCell>
                                <TableCell>{c.phone ?? "—"}</TableCell>
                                <TableCell className="text-right">
                                    {c._count.orders}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            onClick={() => openEdit(c)}
                                            size="icon"
                                            variant="ghost"
                                        >
                                            <IconPencil className="size-4" />
                                        </Button>

                                        <Button
                                            disabled={c._count.orders > 0}
                                            onClick={() => setDeleting(c)}
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

            <CustomerFormDialog
                customer={editing}
                onOpenChange={setFormOpen}
                open={formOpen}
            />

            <AlertDialog
                onOpenChange={(open) => !open && setDeleting(undefined)}
                open={Boolean(deleting)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete customer?</AlertDialogTitle>

                        <AlertDialogDescription>
                            This permanently deletes "{deleting?.name}". This
                            can't be undone.
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
