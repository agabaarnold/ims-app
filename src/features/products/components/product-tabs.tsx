import { useNavigate } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import type { getProductDetails } from "../functions";
import ProductMovementsTab from "./product-movements-tab";
import StockLevelsTable from "./stock-levels-tab";
import ProductAuditLogTab from "./product-auditlog-tab";

interface ProductTabsSchema {
    product: Awaited<ReturnType<typeof getProductDetails>>;
    search: {
        tab: "stock" | "movements" | "audit";
        movementsPage: number;
        auditPage: number;
    };
}

export default function ProductTabs({ product, search }: ProductTabsSchema) {
    const navigate = useNavigate({ from: "/products/$productId/" });

    return (
        <Tabs
            onValueChange={(tab) =>
                navigate({
                    search: (prev) => ({
                        ...prev,
                        tab: tab as typeof search.tab,
                    }),
                })
            }
            value={search.tab}
        >
            <TabsList>
                <TabsTrigger value="stock">Stock levels</TabsTrigger>
                <TabsTrigger value="movements">Movements</TabsTrigger>
                <TabsTrigger value="audit">Audit log</TabsTrigger>
            </TabsList>

            <TabsContent value="stock">
                <StockLevelsTable inventoryItems={product.inventoryItems} />
            </TabsContent>

            <TabsContent value="movements">
                <ProductMovementsTab
                    active={search.tab === "movements"}
                    onPageChange={(page) =>
                        navigate({
                            search: (prev) => ({
                                ...prev,
                                movementsPage: page,
                            }),
                        })
                    }
                    page={search.movementsPage}
                    productId={product.id}
                />
            </TabsContent>

            <TabsContent value="audit">
                <ProductAuditLogTab
                    active={search.tab === "audit"}
                    onPageChange={(page) =>
                        navigate({
                            search: (prev) => ({ ...prev, auditPage: page }),
                        })
                    }
                    page={search.auditPage}
                    productId={product.id}
                />
            </TabsContent>
        </Tabs>
    );
}
