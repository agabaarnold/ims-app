import { prisma } from "./db";

export async function generateSku(categoryId: string) {
    const category = await prisma.category.update({
        where: {
            id: categoryId,
        },
        data: {
            skuSequence: {
                increment: 1,
            },
        },
        select: {
            code: true,
            skuSequence: true,
        },
    });

    return `PRD-${category.code}-${category.skuSequence}`;
}
