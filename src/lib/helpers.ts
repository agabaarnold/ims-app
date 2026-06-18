import { prisma } from "./db";

type SkuClient = Pick<typeof prisma, "category">;

export async function generateSku(
    categoryId: string,
    db: SkuClient = prisma
): Promise<string> {
    const category = await db.category.update({
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
