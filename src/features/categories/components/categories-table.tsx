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
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table";
import { deleteCategory } from "../functions/index";
import { buildCategoryTree, type CategoryWithCounts } from "../functions/utils";
import CategoryFormDialog from "./category-form-dialog";

interface CategoriesTableProps {
    categories: CategoryWithCounts[];
}

export default function CategoriesTable({ categories }: CategoriesTableProps) {
    const queryClient = useQueryClient();
    const tree = buildCategoryTree(categories);

    const [formOpen, setFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<
        CategoryWithCounts | undefined
    >();
    const [deletingCategory, setDeletingCategory] = useState<
        CategoryWithCounts | undefined
    >();

    const openCreate = () => {
        setEditingCategory(undefined);
        setFormOpen(true);
    };

    const openEdit = (category: CategoryWithCounts) => {
        setEditingCategory(category);
        setFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingCategory) {
            return;
        }
        try {
            await deleteCategory({ data: { id: deletingCategory.id } });
            toast.success("Category deleted");
            await queryClient.invalidateQueries({ queryKey: ["categories"] });
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to delete category"
            );
        } finally {
            setDeletingCategory(undefined);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={openCreate}>
                    <IconPlus className="size-4" />
                    New category
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead className="text-right">
                            Subcategories
                        </TableHead>
                        <TableHead className="text-right">Products</TableHead>
                        <TableHead className="w-0" />
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {tree.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell>
                                <span
                                    className="inline-block"
                                    style={{
                                        paddingLeft: `${category.depth * 1.25}rem`,
                                    }}
                                >
                                    {category.depth > 0 && (
                                        <span className="mr-1 text-muted-foreground">
                                            └
                                        </span>
                                    )}
                                    {category.name}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{category.code}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {category._count.children}
                            </TableCell>
                            <TableCell className="text-right">
                                {category._count.products}
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-1">
                                    <Button
                                        aria-label={`Edit category ${category.name}`}
                                        onClick={() => openEdit(category)}
                                        size="icon"
                                        variant="ghost"
                                    >
                                        <IconPencil className="size-4" />
                                    </Button>
                                    <Button
                                        aria-label={`Delete category ${category.name}`}
                                        disabled={
                                            category._count.children > 0 ||
                                            category._count.products > 0
                                        }
                                        onClick={() =>
                                            setDeletingCategory(category)
                                        }
                                        size="icon"
                                        variant="ghost"
                                    >
                                        <IconTrash className="size-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <CategoryFormDialog
                categories={categories}
                category={editingCategory}
                onOpenChange={setFormOpen}
                open={formOpen}
            />

            <AlertDialog
                onOpenChange={(open) => !open && setDeletingCategory(undefined)}
                open={Boolean(deletingCategory)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "
                            {deletingCategory?.name}". This can't be undone.
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
