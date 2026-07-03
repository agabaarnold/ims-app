import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/lib/db";
import { authMiddleware } from "#/middleware";
import {
    advanceOrderStatusSchema,
    CANCELLABLE_STATUSES,
    cancelOrderSchema,
    confirmOrderSchema,
    createOrderSchema,
    getOrderSchema,
    getOrdersSchema,
    INVENTORY_TOUCHED_STATUSES,
    NEXT_STATUS,
} from "../schema";

function generateOrderNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `ORD-${date}-${rand}`;
}

function computeLineTotal(
    qty: number,
    price: number,
    discount: number
): number {
    return qty * price * (1 - discount / 100);
}

// TODO: Add the missing permission middleware like we did for products, and warehouses. For now, any authenticated user can create/confirm/cancel orders.

export const getOrderFormData = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(async () => {
        const [customers, products, warehouses] = await prisma.$transaction([
            prisma.customer.findMany({
                orderBy: { name: "asc" },
                select: { id: true, name: true },
            }),
            prisma.product.findMany({
                where: { isActive: true },
                orderBy: { name: "asc" },
                select: {
                    id: true,
                    name: true,
                    sku: true,
                    unit: true,
                    sellingPrice: true,
                },
            }),
            prisma.warehouse.findMany({
                orderBy: { name: "asc" },
                select: { id: true, name: true },
            }),
        ]);

        return {
            customers,
            products: products.map((p) => ({
                ...p,
                sellingPrice: p.sellingPrice.toNumber(),
            })),
            warehouses,
        };
    });

export const getOrders = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(getOrdersSchema)
    .handler(async ({ data }) => {
        const { page, pageSize, search, status } = data;
        const skip = (page - 1) * pageSize;

        const where = {
            AND: [
                status ? { status } : {},
                search
                    ? {
                          OR: [
                              {
                                  orderNumber: {
                                      contains: search,
                                      mode: "insensitive" as const,
                                  },
                              },
                              {
                                  customer: {
                                      name: {
                                          contains: search,
                                          mode: "insensitive" as const,
                                      },
                                  },
                              },
                          ],
                      }
                    : {},
            ],
        };

        const [orders, total] = await prisma.$transaction([
            prisma.order.findMany({
                where,
                include: {
                    customer: { select: { id: true, name: true } },
                    _count: { select: { items: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
            prisma.order.count({ where }),
        ]);

        return {
            orders: orders.map((o) => ({
                ...o,
                totalAmount: o.totalAmount.toNumber(),
            })),
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
        };
    });

export const getOrder = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(getOrderSchema)
    .handler(async ({ data }) => {
        const order = await prisma.order.findUnique({
            where: { id: data.id },
            include: {
                customer: true,
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
        if (!order) {
            throw new Error(`Order ${data.id} not found`);
        }

        return {
            ...order,
            totalAmount: order.totalAmount.toNumber(),
            items: order.items.map((item) => ({
                ...item,
                unitPrice: item.unitPrice.toNumber(),
                discount: item.discount.toNumber(),
            })),
        };
    });

export const createOrder = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(createOrderSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;
        const totalAmount = data.items.reduce(
            (sum, item) =>
                sum +
                computeLineTotal(item.quantity, item.unitPrice, item.discount),
            0
        );

        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    orderNumber: generateOrderNumber(),
                    customerId: data.customerId,
                    note: data.note,
                    totalAmount,
                    createdById: user.id,
                    items: {
                        create: data.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            discount: item.discount,
                        })),
                    },
                },
            });

            await tx.auditLog.create({
                data: {
                    action: "CREATE",
                    userId: user.id,
                    entityId: order.id,
                    entityType: "ORDER",
                    after: {
                        orderNumber: order.orderNumber,
                        customerId: data.customerId,
                        totalAmount,
                        itemCount: data.items.length,
                    },
                },
            });

            return { ...order, totalAmount: order.totalAmount.toNumber() };
        });
    });

export const confirmOrder = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(confirmOrderSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: data.id },
                include: { items: true },
            });
            if (!order) {
                throw new Error(`Order ${data.id} not found`);
            }
            if (order.status !== "PENDING") {
                throw new Error("Only pending orders can be confirmed.");
            }

            // Validate all stock before writing anything
            for (const item of order.items) {
                const inventory = await tx.inventoryItem.findUnique({
                    where: {
                        productId_warehouseId: {
                            productId: item.productId,
                            warehouseId: data.warehouseId,
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
                            `${available} available, ${item.quantity} needed.`
                    );
                }
            }

            // All checks passed — write inventory changes
            for (const item of order.items) {
                await tx.inventoryItem.update({
                    where: {
                        productId_warehouseId: {
                            productId: item.productId,
                            warehouseId: data.warehouseId,
                        },
                    },
                    data: { quantity: { decrement: item.quantity } },
                });

                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        warehouseId: data.warehouseId,
                        type: "SELL",
                        quantity: item.quantity,
                        // Store orderNumber as reference so cancelOrder can
                        // find these movements and reverse them if needed
                        reference: order.orderNumber,
                        createdById: user.id,
                    },
                });
            }

            const confirmed = await tx.order.update({
                where: { id: order.id },
                data: { status: "CONFIRMED" },
            });

            await tx.auditLog.create({
                data: {
                    action: "APPROVE",
                    userId: user.id,
                    entityId: order.id,
                    entityType: "ORDER",
                    before: { status: "PENDING" },
                    after: {
                        status: "CONFIRMED",
                        warehouseId: data.warehouseId,
                    },
                },
            });

            return {
                ...confirmed,
                totalAmount: confirmed.totalAmount.toNumber(),
            };
        });
    });

export const advanceOrderStatus = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(advanceOrderStatusSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id: data.id } });
            if (!order) {
                throw new Error(`Order ${data.id} not found`);
            }

            const nextStatus =
                NEXT_STATUS[order.status as keyof typeof NEXT_STATUS];
            if (!nextStatus) {
                throw new Error(
                    `Order cannot be advanced from status ${order.status}.`
                );
            }

            const updated = await tx.order.update({
                where: { id: order.id },
                data: { status: nextStatus },
            });

            await tx.auditLog.create({
                data: {
                    action: "UPDATE",
                    userId: user.id,
                    entityId: order.id,
                    entityType: "ORDER",
                    before: { status: order.status },
                    after: { status: nextStatus },
                },
            });

            return { ...updated, totalAmount: updated.totalAmount.toNumber() };
        });
    });

export const cancelOrder = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(cancelOrderSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id: data.id } });
            if (!order) {
                throw new Error(`Order ${data.id} not found`);
            }

            if (!CANCELLABLE_STATUSES.has(order.status)) {
                throw new Error(
                    `Can't cancel an order with status ${order.status}.`
                );
            }

            // If inventory was already decremented, restore it
            if (INVENTORY_TOUCHED_STATUSES.has(order.status)) {
                const sellMovements = await tx.stockMovement.findMany({
                    where: { reference: order.orderNumber, type: "SELL" },
                });

                for (const movement of sellMovements) {
                    await tx.inventoryItem.update({
                        where: {
                            productId_warehouseId: {
                                productId: movement.productId,
                                warehouseId: movement.warehouseId,
                            },
                        },
                        data: { quantity: { increment: movement.quantity } },
                    });

                    await tx.stockMovement.create({
                        data: {
                            productId: movement.productId,
                            warehouseId: movement.warehouseId,
                            type: "ADJUST",
                            quantity: movement.quantity,
                            reference: order.orderNumber,
                            note: `Cancelled order ${order.orderNumber}`,
                            createdById: user.id,
                        },
                    });
                }
            }

            const cancelled = await tx.order.update({
                where: { id: order.id },
                data: { status: "CANCELLED" },
            });

            await tx.auditLog.create({
                data: {
                    action: "CANCEL",
                    userId: user.id,
                    entityId: order.id,
                    entityType: "ORDER",
                    before: { status: order.status },
                    after: { status: "CANCELLED" },
                },
            });

            return {
                ...cancelled,
                totalAmount: cancelled.totalAmount.toNumber(),
            };
        });
    });
