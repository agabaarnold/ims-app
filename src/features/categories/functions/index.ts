import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/lib/db";
import {
    authMiddleware,
    createCategoryMiddleware,
    deleteCategoryMiddleware,
    updateCategoryMiddleware,
} from "#/middleware";
import {
    createCategorySchema,
    deleteCategorySchema,
    updateCategorySchema,
} from "../schema";

export const getCategories = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(
        async () =>
            await prisma.category.findMany({
                orderBy: { name: "asc" },
                include: {
                    _count: { select: { children: true, products: true } },
                },
            })
    );

export const createCategory = createServerFn({ method: "POST" })
    .middleware([authMiddleware, createCategoryMiddleware])
    .validator(createCategorySchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const category = await tx.category.create({ data });

            await tx.auditLog.create({
                data: {
                    action: "CREATE",
                    userId: user.id,
                    entityId: category.id,
                    entityType: "CATEGORY",
                    after: {
                        name: category.name,
                        code: category.code,
                        parentId: category.parentId,
                    },
                },
            });

            return category;
        });
    });

/** Walks up from `newParentId` to see if `categoryId` is among its ancestors. */
async function wouldCreateCycle(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    categoryId: string,
    newParentId: string
): Promise<boolean> {
    if (newParentId === categoryId) {
        return true;
    }

    let currentId: string | null = newParentId;
    const visited = new Set<string>();

    while (currentId) {
        if (currentId === categoryId) {
            return true;
        }

        if (visited.has(currentId)) {
            break; // safety net against pre-existing bad data
        }
        visited.add(currentId);

        const current = await tx.category.findUnique({
            where: { id: currentId },
            select: { parentId: true },
        });
        currentId = current?.parentId ?? null;
    }

    return false;
}

export const updateCategory = createServerFn({ method: "POST" })
    .middleware([authMiddleware, updateCategoryMiddleware])
    .validator(updateCategorySchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const before = await tx.category.findUnique({
                where: { id: data.id },
            });
            if (!before) {
                throw new Error(`Category with id ${data.id} not found`);
            }

            if (
                data.parentId &&
                (await wouldCreateCycle(tx, data.id, data.parentId))
            ) {
                throw new Error(
                    "Can't set a category's parent to itself or one of its own subcategories."
                );
            }

            const category = await tx.category.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    code: data.code,
                    description: data.description,
                    parentId: data.parentId,
                },
            });

            await tx.auditLog.create({
                data: {
                    action: "UPDATE",
                    userId: user.id,
                    entityId: category.id,
                    entityType: "CATEGORY",
                    before: {
                        name: before.name,
                        code: before.code,
                        parentId: before.parentId,
                    },
                    after: {
                        name: category.name,
                        code: category.code,
                        parentId: category.parentId,
                    },
                },
            });

            return category;
        });
    });

export const deleteCategory = createServerFn({ method: "POST" })
    .middleware([authMiddleware, deleteCategoryMiddleware])
    .validator(deleteCategorySchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const category = await tx.category.findUnique({
                where: { id: data.id },
                include: {
                    _count: { select: { children: true, products: true } },
                },
            });
            if (!category) {
                throw new Error(`Category with id ${data.id} not found`);
            }
            if (category._count.children > 0) {
                throw new Error(
                    "Can't delete a category that has subcategories. Move or delete them first."
                );
            }
            if (category._count.products > 0) {
                throw new Error(
                    "Can't delete a category with products assigned. Reassign those products first."
                );
            }

            await tx.category.delete({ where: { id: data.id } });

            await tx.auditLog.create({
                data: {
                    action: "DELETE",
                    userId: user.id,
                    entityId: category.id,
                    entityType: "CATEGORY",
                    before: { name: category.name, code: category.code },
                },
            });
        });
    });
