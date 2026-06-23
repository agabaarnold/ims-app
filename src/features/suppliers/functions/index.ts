import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/lib/db";
import {
    authMiddleware,
    createSupplierMiddleware,
    deleteSupplierMiddleware,
    updateSupplierMiddleware,
} from "#/middleware";
import {
    createSupplierSchema,
    deleteSupplierSchema,
    getSuppliersSchema,
    updateSupplierSchema,
} from "../schema";

export const getSuppliers = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(getSuppliersSchema)
    .handler(async ({ data }) => {
        const { page, pageSize, search } = data;
        const skip = (page - 1) * pageSize;

        const [suppliers, total] = await prisma.$transaction([
            prisma.supplier.findMany({
                include: {
                    _count: {
                        select: { products: true, purchaseOrders: true },
                    },
                },
                orderBy: { name: "asc" },
                skip,
                take: pageSize,
                where: {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        {
                            contactName: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        { email: { contains: search, mode: "insensitive" } },
                        { phone: { contains: search, mode: "insensitive" } },
                    ],
                },
            }),
            prisma.supplier.count(),
        ]);

        return {
            suppliers,
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
        };
    });

export const createSupplier = createServerFn({ method: "POST" })
    .middleware([authMiddleware, createSupplierMiddleware])
    .validator(createSupplierSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const supplier = await tx.supplier.create({ data });

            await tx.auditLog.create({
                data: {
                    action: "CREATE",
                    userId: user.id,
                    entityId: supplier.id,
                    entityType: "SUPPLIER",
                    after: { name: supplier.name, email: supplier.email },
                },
            });

            return supplier;
        });
    });

export const updateSupplier = createServerFn({ method: "POST" })
    .middleware([authMiddleware, updateSupplierMiddleware])
    .validator(updateSupplierSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const before = await tx.supplier.findUnique({
                where: { id: data.id },
            });
            if (!before) {
                throw new Error(`Supplier with id ${data.id} not found`);
            }

            const supplier = await tx.supplier.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    contactName: data.contactName,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    notes: data.notes,
                },
            });

            await tx.auditLog.create({
                data: {
                    action: "UPDATE",
                    userId: user.id,
                    entityId: supplier.id,
                    entityType: "SUPPLIER",
                    before: {
                        name: before.name,
                        email: before.email,
                        phone: before.phone,
                    },
                    after: {
                        name: supplier.name,
                        email: supplier.email,
                        phone: supplier.phone,
                    },
                },
            });

            return supplier;
        });
    });

export const deleteSupplier = createServerFn({ method: "POST" })
    .middleware([authMiddleware, deleteSupplierMiddleware])
    .validator(deleteSupplierSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const supplier = await tx.supplier.findUnique({
                where: { id: data.id },
                include: {
                    _count: {
                        select: { products: true, purchaseOrders: true },
                    },
                },
            });
            if (!supplier) {
                throw new Error(`Supplier with id ${data.id} not found`);
            }
            if (supplier._count.products > 0) {
                throw new Error(
                    "Can't delete a supplier with products assigned. Reassign those products first."
                );
            }
            if (supplier._count.purchaseOrders > 0) {
                throw new Error(
                    "Can't delete a supplier with purchase order history."
                );
            }

            await tx.supplier.delete({ where: { id: data.id } });

            await tx.auditLog.create({
                data: {
                    action: "DELETE",
                    userId: user.id,
                    entityId: supplier.id,
                    entityType: "SUPPLIER",
                    before: { name: supplier.name },
                },
            });
        });
    });
