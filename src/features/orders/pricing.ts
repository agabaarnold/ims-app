export function computeLineTotal(
    quantity: number,
    unitPrice: number,
    discount: number
): number {
    return quantity * unitPrice * (1 - discount / 100);
}
