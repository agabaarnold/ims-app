import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/lib/db";
import { authMiddleware } from "#/middleware";
import {
    createWarehouseSchema,
    deleteWarehouseSchema,
    updateWarehouseSchema,
} from "../schema";

// TODO: Add the necessary middleware to cut out users who don't have permissions

export const getWarehouses = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(
        async () =>
            await prisma.warehouse.findMany({
                orderBy: { name: "asc" },
                include: {
                    _count: {
                        select: {
                            inventoryItems: true,
                            stockMovements: true,
                            transfersFrom: true,
                            transfersTo: true,
                        },
                    },
                },
            })
    );

export const createWarehouse = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(createWarehouseSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const warehouse = await tx.warehouse.create({ data });

            await tx.auditLog.create({
                data: {
                    action: "CREATE",
                    userId: user.id,
                    entityId: warehouse.id,
                    entityType: "WAREHOUSE",
                    after: {
                        name: warehouse.name,
                        location: warehouse.location,
                    },
                },
            });

            return warehouse;
        });
    });

export const updateWarehouse = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(updateWarehouseSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const before = await tx.warehouse.findUnique({
                where: { id: data.id },
            });
            if (!before) {
                throw new Error(`Warehouse with id ${data.id} not found`);
            }

            const warehouse = await tx.warehouse.update({
                where: { id: data.id },
                data: { name: data.name, location: data.location },
            });

            await tx.auditLog.create({
                data: {
                    action: "UPDATE",
                    userId: user.id,
                    entityId: warehouse.id,
                    entityType: "WAREHOUSE",
                    before: { name: before.name, location: before.location },
                    after: {
                        name: warehouse.name,
                        location: warehouse.location,
                    },
                },
            });

            return warehouse;
        });
    });

export const deleteWarehouse = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(deleteWarehouseSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const warehouse = await tx.warehouse.findUnique({
                where: { id: data.id },
                include: {
                    _count: {
                        select: {
                            inventoryItems: true,
                            stockMovements: true,
                            transfersFrom: true,
                            transfersTo: true,
                        },
                    },
                },
            });
            if (!warehouse) {
                throw new Error(`Warehouse with id ${data.id} not found`);
            }
            if (warehouse._count.inventoryItems > 0) {
                throw new Error(
                    "Can't delete a warehouse that has inventory. Transfer or clear stock first."
                );
            }
            if (warehouse._count.stockMovements > 0) {
                throw new Error(
                    "Can't delete a warehouse with stock movement history."
                );
            }
            if (
                warehouse._count.transfersFrom > 0 ||
                warehouse._count.transfersTo > 0
            ) {
                throw new Error(
                    "Can't delete a warehouse involved in stock transfers."
                );
            }

            await tx.warehouse.delete({ where: { id: data.id } });

            await tx.auditLog.create({
                data: {
                    action: "DELETE",
                    userId: user.id,
                    entityId: warehouse.id,
                    entityType: "WAREHOUSE",
                    before: { name: warehouse.name },
                },
            });
        });
    });
