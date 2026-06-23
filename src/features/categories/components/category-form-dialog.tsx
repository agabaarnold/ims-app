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
import { createCategory, updateCategory } from "../functions/index";
import { type CategoryWithCounts, getDescendantIds } from "../functions/utils";
import {
    type CreateCategoryInput,
    createCategorySchema,
    updateCategorySchema,
} from "../schema";

interface CategoryFormDialogProps {
    categories: CategoryWithCounts[];
    category?: CategoryWithCounts;
    onOpenChange: (open: boolean) => void;
    open: boolean;
}

export default function CategoryFormDialog({
    open,
    onOpenChange,
    categories,
    category,
}: CategoryFormDialogProps) {
    const isEditing = Boolean(category);

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit category" : "New category"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update this category's details."
                            : "Add a new category to your catalog."}
                    </DialogDescription>
                </DialogHeader>

                {/* key forces a fresh form instance per category/create so
                    defaultValues are recaptured correctly each time the dialog opens */}
                {open && (
                    <CategoryForm
                        categories={categories}
                        category={category}
                        key={category?.id ?? "new"}
                        onDone={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function CategoryForm({
    category,
    categories,
    onDone,
}: {
    category?: CategoryWithCounts;
    categories: CategoryWithCounts[];
    onDone: () => void;
}) {
    const queryClient = useQueryClient();
    const isEditing = Boolean(category);

    const excludedParentIds = category
        ? new Set([category.id, ...getDescendantIds(categories, category.id)])
        : new Set<string>();

    const parentOptions = categories.filter(
        (c) => !excludedParentIds.has(c.id)
    );

    const defaultValues: CreateCategoryInput = {
        name: category?.name ?? "",
        code: category?.code ?? "",
        description: category?.description ?? "",
        parentId: category?.parentId ?? "",
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                const payload = {
                    ...value,
                    description: value.description?.trim() || null,
                    parentId: value.parentId?.trim() || null,
                };

                if (isEditing && category) {
                    await updateCategory({
                        data: { ...payload, id: category.id },
                    });
                    toast.success("Category updated");
                } else {
                    await createCategory({ data: payload });
                    toast.success("Category created");
                }

                await queryClient.invalidateQueries({
                    queryKey: ["categories"],
                });
                onDone();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to save category"
                );
            }
        },
        validators: {
            onDynamic: isEditing ? updateCategorySchema : createCategorySchema,
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
                                placeholder="Electronics"
                                type="text"
                            />
                        )}
                    </form.AppField>

                    <form.AppField name="code">
                        {(field) => (
                            <field.FormInput
                                label="Code"
                                placeholder="ELEC"
                                type="text"
                            />
                        )}
                    </form.AppField>
                </div>

                <form.AppField name="parentId">
                    {(field) => (
                        <field.FormSelect
                            getOptionLabel={(c) => c.name}
                            getOptionValue={(c) => c.id}
                            label="Parent category"
                            options={parentOptions}
                            placeholder="No parent (top-level category)"
                        />
                    )}
                </form.AppField>

                <form.AppField name="description">
                    {(field) => (
                        <field.FormTextArea
                            label="Description"
                            placeholder="Optional notes about this category"
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
                                isEditing ? "Save changes" : "Create category"
                            }
                        />
                    </form.AppForm>
                </DialogFooter>
            </FieldGroup>
        </form>
    );
}
