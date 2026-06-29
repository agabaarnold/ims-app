import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import {
    getPurchaseOrder,
    getPurchaseOrderFormData,
    getPurchaseOrders,
} from "./index";

export const purchaseOrderFormDataQueryOptions = queryOptions({
    queryKey: ["purchase-orders", "form-data"],
    queryFn: () => getPurchaseOrderFormData(),
});

const PAGE_SIZE = 10;

export const purchaseOrdersQueryOptions = (
    page: number,
    search: string,
    status?: string
) =>
    queryOptions({
        queryKey: ["purchase-orders", page, search, status],
        queryFn: () =>
            getPurchaseOrders({
                data: {
                    page,
                    pageSize: PAGE_SIZE,
                    search,
                    // biome-ignore lint/suspicious/noExplicitAny: Ignore
                    status: status as any,
                },
            }),
        placeholderData: keepPreviousData,
    });

export const purchaseOrderQueryOptions = (poId: string) =>
    queryOptions({
        queryKey: ["purchase-orders", poId],
        queryFn: () => getPurchaseOrder({ data: { id: poId } }),
    });
