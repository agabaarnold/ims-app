import { createServerFn } from "@tanstack/react-start";
import type { Prisma } from "#/generated/prisma/client";
import { prisma } from "#/lib/db";
import {
    authMiddleware,
    cancelStockTransferMiddleware,
    completeStockTransferMiddleware,
    createStockTransferMiddleware,
} from "#/middleware";
import {
    cancelStockTransferSchema,
    completeStockTransferSchema,
    createStockTransferSchema,
    getStockTransferSchema,
    getStockTransfersSchema,
} from "../schema";

export const getStockTransfers = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(getStockTransfersSchema)
    .handler(async ({ data }) => {
        const { page, pageSize, status } = data;
        const skip = (page - 1) * pageSize;

        const where = status ? { status } : {};

        const [transfers, total] = await prisma.$transaction([
            prisma.stockTransfer.findMany({
                where,
                include: {
                    fromWarehouse: { select: { id: true, name: true } },
                    toWarehouse: { select: { id: true, name: true } },
                    createdBy: { select: { id: true, name: true } },
                    _count: { select: { items: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
            prisma.stockTransfer.count({ where }),
        ]);

        return {
            transfers,
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
        };
    });

export const getStockTransfer = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(getStockTransferSchema)
    .handler(async ({ data }) => {
        const transfer = await prisma.stockTransfer.findUnique({
            where: { id: data.id },
            include: {
                fromWarehouse: { select: { id: true, name: true } },
                toWarehouse: { select: { id: true, name: true } },
                createdBy: { select: { id: true, name: true } },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                sku: true,
                                unit: true,
                            },
                        },
                    },
                },
            },
        });
        if (!transfer) {
            throw new Error(`Stock transfer with id ${data.id} not found`);
        }
        return transfer;
    });

export const getStockTransferFormData = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(async ({ data }) => {
        // Accept optional query params to avoid returning every product
        // - `q`: search term for name/sku
        // - `page`/`pageSize`: pagination for product list
        // - `productIds`: explicit list of product ids to load (e.g. currently-selected lines)
        const {
            q,
            page = 1,
            pageSize = 50,
            productIds,
        } = (data ?? {}) as {
            q?: string;
            page?: number;
            pageSize?: number;
            productIds?: string[];
        };

        const skip = Math.max(0, (page - 1) * pageSize);

        const productWhere: Prisma.ProductWhereInput =
            productIds && productIds.length > 0
                ? { id: { in: productIds } }
                : {
                      isActive: true,
                      ...(q
                          ? {
                                OR: [
                                    {
                                        name: {
                                            contains: q,
                                            mode: "insensitive",
                                        },
                                    },
                                    {
                                        sku: {
                                            contains: q,
                                            mode: "insensitive",
                                        },
                                    },
                                ],
                            }
                          : {}),
                  };

        const [warehouses, products, total] = await prisma.$transaction([
            prisma.warehouse.findMany({
                orderBy: { name: "asc" },
                select: { id: true, name: true },
            }),
            prisma.product.findMany({
                where: productWhere,
                orderBy: { name: "asc" },
                skip: productIds && productIds.length > 0 ? undefined : skip,
                take:
                    productIds && productIds.length > 0 ? undefined : pageSize,
                select: {
                    id: true,
                    name: true,
                    sku: true,
                    unit: true,
                    // Nested inventory lets the client compute available
                    // qty per warehouse without a second round-trip
                    inventoryItems: {
                        select: {
                            warehouseId: true,
                            quantity: true,
                            reservedQuantity: true,
                        },
                    },
                },
            }),
            prisma.product.count({ where: productWhere }),
        ]);

        return {
            warehouses,
            products,
            meta: {
                total,
                page,
                pageSize,
                // If productIds were requested we return them all regardless
                // of pagination; caller can distinguish by checking productIds
            },
        };
    });

export const createStockTransfer = createServerFn({ method: "POST" })
    .middleware([authMiddleware, createStockTransferMiddleware])
    .validator(createStockTransferSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const transfer = await tx.stockTransfer.create({
                data: {
                    fromWarehouseId: data.fromWarehouseId,
                    toWarehouseId: data.toWarehouseId,
                    createdById: user.id,
                    items: {
                        create: data.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                        })),
                    },
                },
            });

            await tx.auditLog.create({
                data: {
                    action: "TRANSFER",
                    userId: user.id,
                    entityId: transfer.id,
                    entityType: "STOCK_TRANSFER",
                    after: {
                        fromWarehouseId: data.fromWarehouseId,
                        toWarehouseId: data.toWarehouseId,
                        itemCount: data.items.length,
                    },
                },
            });

            return transfer;
        });
    });

export const completeStockTransfer = createServerFn({ method: "POST" })
    .middleware([authMiddleware, completeStockTransferMiddleware])
    .validator(completeStockTransferSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const transfer = await tx.stockTransfer.findUnique({
                where: { id: data.id },
                include: { items: true },
            });
            if (!transfer) {
                throw new Error(`Stock transfer with id ${data.id} not found`);
            }
            if (transfer.status !== "PENDING") {
                throw new Error(
                    `Can't complete a transfer that is already ${transfer.status.toLowerCase()}.`
                );
            }

            // Validate all lines have sufficient available stock before
            // writing anything — prevents partial completion on a bad request
            for (const item of transfer.items) {
                const inventory = await tx.inventoryItem.findUnique({
                    where: {
                        productId_warehouseId: {
                            productId: item.productId,
                            warehouseId: transfer.fromWarehouseId,
                        },
                    },
                });
                const available = inventory
                    ? inventory.quantity - inventory.reservedQuantity
                    : 0;
                if (item.quantity > available) {
                    const product = await tx.product.findUnique({
                        where: { id: item.productId },
                        select: { name: true },
                    });
                    throw new Error(
                        `Insufficient stock for "${product?.name ?? item.productId}": ` +
                            `${available} available, ${item.quantity} requested.`
                    );
                }
            }

            const reference = `TRF-${transfer.id.slice(-8).toUpperCase()}`;

            // Now write — all checks passed
            for (const item of transfer.items) {
                // Decrement source
                await tx.inventoryItem.update({
                    where: {
                        productId_warehouseId: {
                            productId: item.productId,
                            warehouseId: transfer.fromWarehouseId,
                        },
                    },
                    data: { quantity: { decrement: item.quantity } },
                });

                // Upsert destination
                await tx.inventoryItem.upsert({
                    where: {
                        productId_warehouseId: {
                            productId: item.productId,
                            warehouseId: transfer.toWarehouseId,
                        },
                    },
                    create: {
                        productId: item.productId,
                        warehouseId: transfer.toWarehouseId,
                        quantity: item.quantity,
                    },
                    update: { quantity: { increment: item.quantity } },
                });

                // Stock movements
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        warehouseId: transfer.fromWarehouseId,
                        type: "TRANSFER_OUT",
                        quantity: item.quantity,
                        reference,
                        createdById: user.id,
                    },
                });
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        warehouseId: transfer.toWarehouseId,
                        type: "TRANSFER_IN",
                        quantity: item.quantity,
                        reference,
                        createdById: user.id,
                    },
                });
            }

            const { count } = await tx.stockTransfer.updateMany({
                where: { id: transfer.id, status: "PENDING" },
                data: { status: "COMPLETED", completedAt: new Date() },
            });
            if (count === 0) {
                throw new Error("Transfer is no longer pending.");
            }
            const completed = await tx.stockTransfer.findUniqueOrThrow({
                where: { id: transfer.id },
            });

            await tx.auditLog.create({
                data: {
                    action: "TRANSFER",
                    userId: user.id,
                    entityId: transfer.id,
                    entityType: "STOCK_TRANSFER",
                    before: { status: "PENDING" },
                    after: { status: "COMPLETED" },
                },
            });

            return completed;
        });
    });

export const cancelStockTransfer = createServerFn({ method: "POST" })
    .middleware([authMiddleware, cancelStockTransferMiddleware])
    .validator(cancelStockTransferSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const transfer = await tx.stockTransfer.findUnique({
                where: { id: data.id },
            });
            if (!transfer) {
                throw new Error(`Stock transfer with id ${data.id} not found`);
            }
            if (transfer.status !== "PENDING") {
                throw new Error(
                    `Can't cancel a transfer that is already ${transfer.status.toLowerCase()}.`
                );
            }

            const { count } = await tx.stockTransfer.updateMany({
                where: { id: data.id, status: "PENDING" },
                data: { status: "CANCELLED" },
            });
            if (count === 0) {
                throw new Error("Transfer is no longer pending.");
            }
            const cancelled = { ...transfer, status: "CANCELLED" as const };

            await tx.auditLog.create({
                data: {
                    action: "CANCEL",
                    userId: user.id,
                    entityId: transfer.id,
                    entityType: "STOCK_TRANSFER",
                    before: { status: "PENDING" },
                    after: { status: "CANCELLED" },
                },
            });

            return cancelled;
        });
    });
