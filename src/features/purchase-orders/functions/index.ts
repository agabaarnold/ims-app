import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/lib/db";
import { authMiddleware } from "#/middleware";
import {
    cancelPurchaseOrderSchema,
    createPurchaseOrderServerSchema,
    getPurchaseOrderSchema,
    getPurchaseOrdersSchema,
    receivePurchaseOrderSchema,
    sendPurchaseOrderSchema,
} from "../schema";

function generatePoNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `PO-${datePart}-${randomPart}`;
}

export const getPurchaseOrders = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(getPurchaseOrdersSchema)
    .handler(async ({ data }) => {
        const { page, pageSize, search, status } = data;
        const skip = (page - 1) * pageSize;

        const [purchaseOrders, total] = await prisma.$transaction([
            prisma.purchaseOrder.findMany({
                include: {
                    supplier: { select: { id: true, name: true } },
                    _count: { select: { items: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
                where: {
                    AND: [
                        status ? { status } : {},
                        {
                            OR: [
                                {
                                    poNumber: {
                                        contains: search,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    supplier: {
                                        name: {
                                            contains: search,
                                            mode: "insensitive",
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            }),
            prisma.purchaseOrder.count(),
        ]);

        return {
            purchaseOrders: purchaseOrders.map((po) => ({
                ...po,
                totalAmount: po.totalAmount.toNumber(),
            })),
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
        };
    });

export const getPurchaseOrder = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(getPurchaseOrderSchema)
    .handler(async ({ data }) => {
        const po = await prisma.purchaseOrder.findUnique({
            where: { id: data.id },
            include: {
                supplier: true,
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
        if (!po) {
            throw new Error(`Purchase order with id ${data.id} not found`);
        }

        return {
            ...po,
            totalAmount: po.totalAmount.toNumber(),
            items: po.items.map((item) => ({
                ...item,
                unitCost: item.unitCost.toNumber(),
            })),
        };
    });

export const getPurchaseOrderFormData = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(async () => {
        const [suppliers, products, warehouses] = await prisma.$transaction([
            prisma.supplier.findMany({
                orderBy: { name: "asc" },
                select: { id: true, name: true },
            }),
            prisma.product.findMany({
                where: { isActive: true },
                orderBy: { name: "asc" },
                select: { id: true, name: true, sku: true, unit: true },
            }),
            prisma.warehouse.findMany({
                orderBy: { name: "asc" },
                select: { id: true, name: true },
            }),
        ]);

        return { suppliers, products, warehouses };
    });

export const createPurchaseOrder = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(createPurchaseOrderServerSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;
        const totalAmount = data.items.reduce(
            (sum, item) => sum + item.orderedQty * item.unitCost,
            0
        );

        return await prisma.$transaction(async (tx) => {
            const po = await tx.purchaseOrder.create({
                data: {
                    poNumber: generatePoNumber(),
                    supplierId: data.supplierId,
                    expectedDate: data.expectedDate,
                    note: data.note,
                    totalAmount,
                    createdById: user.id,
                    items: {
                        create: data.items.map((item) => ({
                            productId: item.productId,
                            orderedQty: item.orderedQty,
                            unitCost: item.unitCost,
                        })),
                    },
                },
            });

            await tx.auditLog.create({
                data: {
                    action: "CREATE",
                    userId: user.id,
                    entityId: po.id,
                    entityType: "PURCHASE_ORDER",
                    after: {
                        poNumber: po.poNumber,
                        supplierId: po.supplierId,
                        totalAmount,
                    },
                },
            });

            return { ...po, totalAmount: po.totalAmount.toNumber() };
        });
    });

export const sendPurchaseOrder = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(sendPurchaseOrderSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const before = await tx.purchaseOrder.findUnique({
                where: { id: data.id },
            });
            if (!before) {
                throw new Error(`Purchase order with id ${data.id} not found`);
            }
            if (before.status !== "DRAFT") {
                throw new Error("Only draft purchase orders can be sent.");
            }

            const po = await tx.purchaseOrder.update({
                where: { id: data.id },
                data: { status: "SENT" },
            });

            await tx.auditLog.create({
                data: {
                    action: "UPDATE",
                    userId: user.id,
                    entityId: po.id,
                    entityType: "PURCHASE_ORDER",
                    before: { status: before.status },
                    after: { status: po.status },
                },
            });

            return { ...po, totalAmount: po.totalAmount.toNumber() };
        });
    });

export const cancelPurchaseOrder = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(cancelPurchaseOrderSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const before = await tx.purchaseOrder.findUnique({
                where: { id: data.id },
            });
            if (!before) {
                throw new Error(`Purchase order with id ${data.id} not found`);
            }
            if (before.status === "RECEIVED" || before.status === "CANCELLED") {
                throw new Error(
                    `Can't cancel a purchase order that is already ${before.status.toLowerCase()}.`
                );
            }

            const po = await tx.purchaseOrder.update({
                where: { id: data.id },
                data: { status: "CANCELLED" },
            });

            await tx.auditLog.create({
                data: {
                    action: "CANCEL",
                    userId: user.id,
                    entityId: po.id,
                    entityType: "PURCHASE_ORDER",
                    before: { status: before.status },
                    after: { status: po.status },
                },
            });

            return { ...po, totalAmount: po.totalAmount.toNumber() };
        });
    });

export const receivePurchaseOrder = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(receivePurchaseOrderSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const po = await tx.purchaseOrder.findUnique({
                where: { id: data.id },
                include: { items: true },
            });
            if (!po) {
                throw new Error(`Purchase order with id ${data.id} not found`);
            }
            if (po.status === "CANCELLED" || po.status === "RECEIVED") {
                throw new Error(
                    `Can't receive against a purchase order that is ${po.status.toLowerCase()}.`
                );
            }

            const itemsById = new Map(po.items.map((item) => [item.id, item]));

            // Validate every line before writing anything — avoid partial receipts
            // on a request that was going to fail halfway through anyway.
            for (const line of data.lines) {
                const item = itemsById.get(line.purchaseOrderItemId);
                if (!item) {
                    throw new Error(
                        "One of the line items doesn't belong to this purchase order."
                    );
                }
                const remaining = item.orderedQty - item.receivedQty;
                if (line.quantity > remaining) {
                    throw new Error(
                        `Can't receive ${line.quantity} units — only ${remaining} remaining on this line.`
                    );
                }
            }

            for (const line of data.lines) {
                if (line.quantity <= 0) {
                    continue;
                }
                // biome-ignore lint/style/noNonNullAssertion: Ignore
                const item = itemsById.get(line.purchaseOrderItemId)!;

                await tx.purchaseOrderItem.update({
                    where: { id: item.id },
                    data: { receivedQty: { increment: line.quantity } },
                });

                await tx.inventoryItem.upsert({
                    where: {
                        productId_warehouseId: {
                            productId: item.productId,
                            warehouseId: data.warehouseId,
                        },
                    },
                    create: {
                        productId: item.productId,
                        warehouseId: data.warehouseId,
                        quantity: line.quantity,
                    },
                    update: { quantity: { increment: line.quantity } },
                });

                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        warehouseId: data.warehouseId,
                        type: "RECEIVE",
                        quantity: line.quantity,
                        reference: po.poNumber,
                        createdById: user.id,
                    },
                });
            }

            const updatedItems = await tx.purchaseOrderItem.findMany({
                where: { purchaseOrderId: po.id },
            });
            const fullyReceived = updatedItems.every(
                (item) => item.receivedQty >= item.orderedQty
            );

            const updatedPo = await tx.purchaseOrder.update({
                where: { id: po.id },
                data: { status: fullyReceived ? "RECEIVED" : "PARTIAL" },
            });

            await tx.auditLog.create({
                data: {
                    action: "RECEIVE",
                    userId: user.id,
                    entityId: po.id,
                    entityType: "PURCHASE_ORDER",
                    metadata: {
                        warehouseId: data.warehouseId,
                        lines: data.lines,
                    },
                    after: { status: updatedPo.status },
                },
            });

            return {
                ...updatedPo,
                totalAmount: updatedPo.totalAmount.toNumber(),
            };
        });
    });
