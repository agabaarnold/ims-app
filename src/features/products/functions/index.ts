import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/lib/db";
import { authMiddleware } from "#/middleware";
import {
    archiveProductSchema,
    createProductSchema,
    getProductSchema,
    getProductsSchema,
    searchProductsSchema,
    updateProductSchema,
} from "../schema";

export const getProducts = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(getProductsSchema)
    .handler(async ({ data }) => {
        const { page, pageSize } = data;
        const skip = (page - 1) * pageSize;

        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                include: { category: true, supplier: true },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
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

export const getProduct = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(getProductSchema)
    .handler(async ({ data }) => {
        const product = await prisma.product.findUnique({
            where: { id: data.id },
            include: { category: true, supplier: true },
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

export const createProduct = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(createProductSchema)
    .handler(async ({ data }) => {
        const newProduct = await prisma.product.create({
            data,
        });

        return {
            ...newProduct,
            costPrice: newProduct.costPrice.toNumber(),
            sellingPrice: newProduct.sellingPrice.toNumber(),
        };
    });

export const updateProduct = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(updateProductSchema)
    .handler(async ({ data }) => {
        const product = await prisma.product.update({
            where: { id: data.id },
            data: {
                categoryId: data.categoryId,
                costPrice: data.costPrice,
                description: data.description,
                imageUrl: data.imageUrl,
                isActive: data.isActive,
                name: data.name,
                reorderPoint: data.reorderPoint,
                reorderQty: data.reorderQuantity,
                sku: data.sku,
                supplierId: data.supplierId,
                unit: data.unit,
            },
        });

        return {
            ...product,
            costPrice: product.costPrice.toNumber(),
            sellingPrice: product.sellingPrice.toNumber(),
        };
    });

export const archiveProduct = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
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

export const searchProducts = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(searchProductsSchema)
    .handler(async ({ data }) => {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: data.search, mode: "insensitive" } },
                    { sku: { contains: data.search, mode: "insensitive" } },
                ],
                isActive: true,
            },
        });

        return {
            products: products.map((product) => ({
                ...product,
                costPrice: product.costPrice.toNumber(),
                sellingPrice: product.sellingPrice.toNumber(),
            })),
        };
    });
