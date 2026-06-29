import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { formatCurrency } from "#/lib/utils";
import type { getProductDetails } from "../functions";

interface ProductCardProps {
    product: Awaited<ReturnType<typeof getProductDetails>>;
}

export default function ProductCard({ product }: ProductCardProps) {
    const margin =
        product.sellingPrice > 0
            ? ((product.sellingPrice - product.costPrice) /
                  product.sellingPrice) *
              100
            : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Overview</CardTitle>
            </CardHeader>

            <CardContent>
                <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Category" value={product.category.name} />
                    <Field
                        label="Supplier"
                        value={product.supplier?.name ?? "—"}
                    />
                    <Field label="Unit" value={product.unit} />
                    <Field
                        label="Cost price"
                        value={formatCurrency(product.costPrice)}
                    />
                    <Field
                        label="Selling price"
                        value={formatCurrency(product.sellingPrice)}
                    />
                    <Field label="Margin" value={`${margin.toFixed(1)}%`} />
                    <Field
                        label="Reorder point"
                        value={product.reorderPoint.toString()}
                    />
                    <Field
                        label="Reorder quantity"
                        value={product.reorderQty.toString()}
                    />
                </dl>

                {product.description && (
                    <p className="mt-6 text-muted-foreground text-sm">
                        {product.description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="font-medium text-muted-foreground text-xs uppercase">
                {label}
            </dt>
            <dd className="mt-1 font-medium text-sm">{value}</dd>
        </div>
    );
}
