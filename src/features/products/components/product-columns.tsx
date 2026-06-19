import { IconCaretUpDown, IconDots } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { useArchiveProduct } from "#/hooks/use-archive-product";
import { formatCurrency } from "#/lib/utils";
import type { getProducts } from "../functions";

export type Products = Awaited<ReturnType<typeof getProducts>>;
export type Product = Products["products"][number];

export const productColumns: ColumnDef<Product>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                aria-label="Select all"
                checked={table.getIsAllPageRowsSelected()}
                indeterminate={table.getIsSomePageRowsSelected()}
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                aria-label="Select row"
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "sku",
        header: ({ column }) => (
            <Button onClick={() => column.toggleSorting()} variant="ghost">
                <span>SKU</span> <IconCaretUpDown />
            </Button>
        ),
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button onClick={() => column.toggleSorting()} variant="ghost">
                <span>Name</span> <IconCaretUpDown />
            </Button>
        ),
    },
    {
        header: "Category",
        cell: ({ row }) => (
            <span className="truncate">{row.original.category.name}</span>
        ),
    },
    { accessorKey: "unit", header: "Unit" },
    {
        accessorKey: "costPrice",
        header: "Cost Price",
        cell: ({ row }) => formatCurrency(row.original.costPrice),
    },
    {
        accessorKey: "sellingPrice",
        header: "Selling Price",
        cell: ({ row }) => formatCurrency(row.original.sellingPrice),
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.isActive;

            return (
                <Badge
                    className={
                        isActive
                            ? "bg-green-200 text-green-800 text-sm dark:bg-green-800 dark:text-green-200"
                            : "bg-amber-200 text-amber-800 text-sm dark:bg-amber-800 dark:text-amber-200"
                    }
                >
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
    },
    {
        header: "Actions",
        cell: ({ row }) => {
            const product = row.original;
            const productId = product.id;

            const { archive } = useArchiveProduct(productId);

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                aria-label="Open product actions"
                                size="icon"
                                variant="ghost"
                            >
                                <IconDots aria-hidden="true" />
                            </Button>
                        }
                    />

                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                render={
                                    <Link
                                        params={{ productId: product.id }}
                                        to="/products/$productId"
                                    >
                                        View
                                    </Link>
                                }
                            />

                            <DropdownMenuItem
                                render={
                                    <Link
                                        params={{ productId: product.id }}
                                        to="/products/$productId/edit"
                                    >
                                        Edit
                                    </Link>
                                }
                            />
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={() => archive()}
                            render={
                                <span className="text-destructive">
                                    Archive
                                </span>
                            }
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
