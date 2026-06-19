import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/lib/db";
import { generateSku } from "#/lib/helpers";
import {
    archiveProductMiddleware,
    authMiddleware,
    createProductMiddleware,
    updateProductMiddleware,
} from "#/middleware";
import {
    archiveProductSchema,
    createProductServerSchema,
    getProductAuditLogsSchema,
    getProductMovementsSchema,
    getProductSchema,
    getProductsSchema,
    updateProductSchema,
} from "../schema";

export const getProducts = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(getProductsSchema)
    .handler(async ({ data }) => {
        const { page, pageSize, search } = data;
        const skip = (page - 1) * pageSize;

        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                include: { category: true, supplier: true },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
                where: {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { sku: { contains: search, mode: "insensitive" } },
                        { unit: { contains: search, mode: "insensitive" } },
                        {
                            description: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            category: {
                                name: { contains: search, mode: "insensitive" },
                            },
                        },
                        {
                            supplier: {
                                name: { contains: search, mode: "insensitive" },
                            },
                        },
                    ],
                },
            }),
            prisma.product.count(),
        ]);

        return {
            products: products.map((product) => ({
                ...product,
                costPrice: product.costPrice.toNumber(),
                sellingPrice: product.sellingPrice.toNumber(),
            })),
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
        };
    });

export const getProductDetails = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(getProductSchema)
    .handler(async ({ data }) => {
        const product = await prisma.product.findUnique({
            where: { id: data.id },
            include: {
                category: true,
                supplier: true,
                inventoryItems: {
                    include: { warehouse: true },
                    orderBy: { warehouse: { name: "asc" } },
                },
            },
        });
        if (!product) {
            throw new Error(`Product with id ${data.id} not found`);
        }

        return {
            ...product,
            costPrice: product.costPrice.toNumber(),
            sellingPrice: product.sellingPrice.toNumber(),
        };
    });

export const getProductFormData = createServerFn({ method: "GET" })
    .middleware([authMiddleware, createProductMiddleware])
    .handler(async () => {
        const [categories, suppliers] = await prisma.$transaction([
            prisma.category.findMany({
                orderBy: {
                    name: "asc",
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            }),
            prisma.supplier.findMany({
                orderBy: {
                    name: "asc",
                },
                select: {
                    id: true,
                    name: true,
                },
            }),
        ]);

        return { categories, suppliers };
    });

export const createProduct = createServerFn({ method: "POST" })
    .middleware([authMiddleware, createProductMiddleware])
    .validator(createProductServerSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        const newProduct = await prisma.$transaction(async (tx) => {
            const sku = await generateSku(data.categoryId, tx);
            const product = await tx.product.create({
                data: { ...data, sku },
            });

            await tx.auditLog.create({
                data: {
                    action: "CREATE",
                    userId: user.id,
                    entityId: product.id,
                    entityType: "PRODUCT",
                    after: {
                        id: product.id,
                        sku: product.sku,
                        name: product.name,
                    },
                },
            });

            return product;
        });

        return {
            ...newProduct,
            costPrice: newProduct.costPrice.toNumber(),
            sellingPrice: newProduct.sellingPrice.toNumber(),
        };
    });

export const updateProduct = createServerFn({ method: "POST" })
    .middleware([authMiddleware, updateProductMiddleware])
    .validator(updateProductSchema)
    .handler(async ({ context: { session }, data }) => {
        const user = session.user;

        return await prisma.$transaction(async (tx) => {
            const before = await tx.product.findUnique({
                where: { id: data.id },
            });
            if (!before) {
                throw new Error(`Product with id ${data.id} not found`);
            }

            const product = await tx.product.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    description: data.description,
                    categoryId: data.categoryId,
                    supplierId: data.supplierId,
                    unit: data.unit,
                    costPrice: data.costPrice,
                    sellingPrice: data.sellingPrice,
                    reorderPoint: data.reorderPoint,
                    reorderQty: data.reorderQty,
                    imageUrl: data.imageUrl,
                    isActive: data.isActive,
                },
            });

            await tx.auditLog.create({
                data: {
                    action: "UPDATE",
                    userId: user.id,
                    entityId: product.id,
                    entityType: "PRODUCT",
                    before: {
                        name: before.name,
                        description: before.description,
                        categoryId: before.categoryId,
                        supplierId: before.supplierId,
                        unit: before.unit,
                        costPrice: before.costPrice.toNumber(),
                        sellingPrice: before.sellingPrice.toNumber(),
                        reorderPoint: before.reorderPoint,
                        reorderQty: before.reorderQty,
                        imageUrl: before.imageUrl,
                        isActive: before.isActive,
                    },
                    after: {
                        name: product.name,
                        description: product.description,
                        categoryId: product.categoryId,
                        supplierId: product.supplierId,
                        unit: product.unit,
                        costPrice: product.costPrice.toNumber(),
                        sellingPrice: product.sellingPrice.toNumber(),
                        reorderPoint: product.reorderPoint,
                        reorderQty: product.reorderQty,
                        imageUrl: product.imageUrl,
                        isActive: product.isActive,
                    },
                },
            });

            return {
                ...product,
                costPrice: product.costPrice.toNumber(),
                sellingPrice: product.sellingPrice.toNumber(),
            };
        });
    });

export const archiveProduct = createServerFn({ method: "POST" })
    .middleware([authMiddleware, archiveProductMiddleware])
    .validator(archiveProductSchema)
    .handler(async ({ data }) => {
        const archivedProduct = await prisma.product.update({
            where: { id: data.id },
            data: { isActive: false },
        });

        return {
            ...archivedProduct,
            costPrice: archivedProduct.costPrice.toNumber(),
            sellingPrice: archivedProduct.sellingPrice.toNumber(),
        };
    });

export const getProductMovements = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(getProductMovementsSchema)
    .handler(async ({ data }) => {
        const { id, page, pageSize } = data;
        const skip = (page - 1) * pageSize;

        const [movements, total] = await prisma.$transaction([
            prisma.stockMovement.findMany({
                where: { productId: id },
                include: {
                    warehouse: { select: { id: true, name: true } },
                    createdBy: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
            prisma.stockMovement.count({ where: { productId: id } }),
        ]);

        return {
            movements,
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
        };
    });

export const getProductAuditLogs = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(getProductAuditLogsSchema)
    .handler(async ({ data }) => {
        const { id, page, pageSize } = data;
        const skip = (page - 1) * pageSize;

        const [logs, total] = await prisma.$transaction([
            prisma.auditLog.findMany({
                where: { entityType: "PRODUCT", entityId: id },
                include: { user: { select: { id: true, name: true } } },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
            prisma.auditLog.count({
                where: { entityType: "PRODUCT", entityId: id },
            }),
        ]);

        return {
            logs,
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
        };
    });
