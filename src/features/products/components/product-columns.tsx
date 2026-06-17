import { IconDots } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
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
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "name", header: "Name" },
    { accessorFn: ({ category }) => category.name, header: "Category" },
    { accessorFn: ({ supplier }) => supplier?.name, header: "Supplier" },
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
        header: "Active",
        cell: ({ row }) => (row.original.isActive ? "Active" : "Archived"),
    },
    {
        header: "Actions",
        cell: ({ row }) => {
            const product = row.original;

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
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
