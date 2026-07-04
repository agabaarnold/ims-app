import { Decimal } from "@prisma/client/runtime/index-browser";

type DecimalValue = Decimal | number | string;

export function computeLineTotal(
    quantity: number,
    unitPrice: DecimalValue,
    discount: DecimalValue
): Decimal {
    const discountMultiplier = new Decimal(1).minus(
        new Decimal(discount).div(100)
    );

    return new Decimal(unitPrice).times(quantity).times(discountMultiplier);
}
