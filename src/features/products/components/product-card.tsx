import { Card } from "#/components/ui/card";
import type { getProductDetails } from "../functions";

interface ProductCardProps {
    product: Awaited<ReturnType<typeof getProductDetails>>;
}

export default function ProductCard({ product }: ProductCardProps) {
    return <Card>ProductCard</Card>;
}
