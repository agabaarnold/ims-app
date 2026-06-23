export interface CategoryWithCounts {
    _count: { children: number; products: number };
    code: string;
    description: string | null;
    id: string;
    name: string;
    parentId: string | null;
}

export interface FlatCategoryNode extends CategoryWithCounts {
    depth: number;
}

/**
 * Flattens the category tree into a depth-annotated list, ordered so that
 * every node appears immediately after its parent (pre-order traversal).
 * Any orphaned rows (parentId pointing nowhere, shouldn't happen given the
 * FK, but defensive) are appended at depth 0 so nothing silently disappears.
 */
export function buildCategoryTree(
    categories: CategoryWithCounts[]
): FlatCategoryNode[] {
    const byParent = new Map<string | null, CategoryWithCounts[]>();
    for (const category of categories) {
        const siblings = byParent.get(category.parentId) ?? [];
        siblings.push(category);
        byParent.set(category.parentId, siblings);
    }

    const visited = new Set<string>();
    const result: FlatCategoryNode[] = [];

    function visit(parentId: string | null, depth: number) {
        const children = byParent.get(parentId) ?? [];
        for (const child of children) {
            visited.add(child.id);
            result.push({ ...child, depth });
            visit(child.id, depth + 1);
        }
    }
    visit(null, 0);

    for (const category of categories) {
        if (!visited.has(category.id)) {
            result.push({ ...category, depth: 0 });
        }
    }

    return result;
}

/** All ids that selecting `rootId` as a parent would turn into a cycle. */
export function getDescendantIds(
    categories: CategoryWithCounts[],
    rootId: string
): Set<string> {
    const byParent = new Map<string, CategoryWithCounts[]>();
    for (const category of categories) {
        if (category.parentId) {
            const siblings = byParent.get(category.parentId) ?? [];
            siblings.push(category);
            byParent.set(category.parentId, siblings);
        }
    }

    const result = new Set<string>();
    function visit(id: string) {
        for (const child of byParent.get(id) ?? []) {
            result.add(child.id);
            visit(child.id);
        }
    }
    visit(rootId);
    return result;
}
