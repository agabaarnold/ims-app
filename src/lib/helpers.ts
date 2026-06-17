import { prisma } from "./db";

export async function generateSku(categoryId: string) {
    const category = await prisma.category.findUniqueOrThrow({
        where: {
            id: categoryId,
        },
        select: {
            code: true,
        },
    });

    const count = await prisma.product.count({
        where: {
            categoryId,
        },
    });

    const sequence = String(count + 1).padStart(5, "0");

    return `PRD-${category.code}-${sequence}`;
}